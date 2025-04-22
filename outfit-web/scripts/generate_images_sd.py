#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服装图片生成脚本 - 使用本地部署的 ComfyUI API

此脚本按照ai-image-generation.mdc规则文档实现，通过本地部署的ComfyUI
自动为服装数据生成统一风格的展示图片。
依赖库: requests, websocket-client (请通过 pip install requests websocket-client 安装)
"""

import os
import json
import random
import base64
import requests
import time
from pathlib import Path
import re
import sys
import uuid
import urllib.request
import urllib.parse
import websocket # 需要安装 websocket-client

# ----- 配置参数 -----
# ComfyUI API地址 (确保你的 ComfyUI 在此地址运行)
COMFYUI_URL = "http://127.0.0.1:8188"
SERVER_ADDRESS = "127.0.0.1:8188" # Websocket 连接地址
CLIENT_ID = str(uuid.uuid4())

# 获取脚本所在目录的绝对路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# 使用绝对路径重新定义文件和目录路径
OUTPUT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../public/images/clothes/items"))
CLOTHES_DATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "../app/data/clothes.js"))
SEED_MAPPING_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "./item_seeds.json"))
WORKFLOW_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "./SD3.5 Medium工作流.json"))

# 图片格式
IMAGE_EXTENSION = ".webp"

# 固定的生成参数
SD_MODEL = "v1-5-pruned-emaonly.safetensors"  # 请替换为你的SD 1.5模型文件名
SD_SAMPLER = "DPM++ 2M Karras"
SD_STEPS = 25
SD_CFG_SCALE = 8
SD_WIDTH = 768
SD_HEIGHT = 768

# ----- 辅助函数 -----
def extract_clothes_data(file_path):
    """
    从clothes.js文件中提取服装数据
    """
    print(f"读取服装数据文件: {file_path}")
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
            # 使用正则表达式找到clothesData数组
            pattern = r'export\s+const\s+clothesData\s*=\s*\[([\s\S]*?)\];'
            match = re.search(pattern, content)
            if not match:
                raise ValueError("无法找到clothesData数组")
                
            # 将JS数组转换为Python可读格式
            js_array = match.group(1)
            # 将JS对象的格式转为JSON格式
            json_array = js_array.replace("'", '"')
            # 确保所有键都有双引号
            json_array = re.sub(r'(\w+):', r'"\1":', json_array)
            
            # 将单独的数组中的单引号替换为双引号
            json_array = re.sub(r'\[([\s\S]*?)\]', lambda m: m.group(0).replace("'", '"'), json_array)
            
            try:
                # 尝试每个对象单独解析
                clothes_data = []
                items = re.findall(r'\{[\s\S]*?\}', json_array)
                
                for item in items:
                    try:
                        # 处理JS注释
                        item = re.sub(r'//.*?\n', '\n', item)
                        item_data = json.loads(item)
                        clothes_data.append(item_data)
                    except json.JSONDecodeError as e:
                        print(f"警告: 解析单个服装项目时出错: {e}")
                        print(f"问题项目: {item}")
                        continue
                
                print(f"成功提取了 {len(clothes_data)} 件服装数据")
                return clothes_data
            except Exception as e:
                print(f"解析服装数据遇到错误: {e}")
                raise
    except Exception as e:
        print(f"读取服装数据文件出错: {e}")
        sys.exit(1)

def load_translations(locale="en"):
    """
    加载i18n翻译，以获取nameKey和styleKey对应的英文名称
    """
    translation_file = f"../public/locales/{locale}/apparel.json"
    translation_file_abs = os.path.abspath(os.path.join(SCRIPT_DIR, translation_file))
    try:
        with open(translation_file_abs, 'r', encoding='utf-8') as file:
            return json.load(file)
    except Exception as e:
        print(f"警告: 无法加载翻译文件 {translation_file_abs}: {e}")
        return {}

def get_key_translation(key, translations, default=""):
    """
    从翻译对象中获取键值对应的翻译
    支持格式: 'items.basic_crew_tshirt', 'style.basic' 等
    """
    if not key or not translations:
        return default
    
    parts = key.split('.')
    if len(parts) != 2:
        return default
    
    category, item_key = parts
    return translations.get(category, {}).get(item_key, default)

def get_file_path(item_id):
    """获取图片文件的完整路径"""
    return os.path.join(OUTPUT_DIR, f"{item_id}{IMAGE_EXTENSION}")

def load_seed_mapping():
    """加载item_id与seed的映射关系"""
    if os.path.exists(SEED_MAPPING_FILE):
        try:
            with open(SEED_MAPPING_FILE, 'r') as file:
                return json.load(file)
        except Exception as e:
            print(f"警告: 读取Seed映射文件出错: {e}")
            return {}
    return {}

def save_seed_mapping(seed_mapping):
    """保存item_id与seed的映射关系"""
    try:
        with open(SEED_MAPPING_FILE, 'w') as file:
            json.dump(seed_mapping, file, indent=2)
        print(f"Seed映射已保存至 {SEED_MAPPING_FILE}")
    except Exception as e:
        print(f"警告: 保存Seed映射文件出错: {e}")

def generate_prompt(item, translations):
    """
    根据服装项目生成提示词
    """
    # 获取颜色名称(英文)
    color_name = item.get('colorName', '')
    color_en = get_key_translation(f"color.{color_name}", translations, color_name)
    
    # 获取服装名称(英文)
    name_key = item.get('nameKey', '')
    item_name_en = get_key_translation(name_key, translations, name_key)
    
    # 获取风格名称(英文)
    style_key = item.get('styleKey', '')
    style_en = get_key_translation(style_key, translations, style_key)
    
    # 新提示词策略 (线条示意图风格)
    positive_style = "line art illustration, clean lines, simple shading"
    base_prompt = f"{positive_style}, {color_en} {item_name_en} ({style_en}), front view, plain white background, no model, no other objects."
    
    # --- 添加 LoRA 调用 (注释掉，如果需要，请确保ComfyUI工作流包含LoRA加载节点) ---
    # lora_filename_no_ext = "Canopus-Clothing-Flux-Dev-Florence2-LoRA" # 您放入 models/Lora 的文件名（不含扩展名）
    # lora_weight = 1.0 # LoRA 权重，可以调整 (例如 0.8, 1.0, 1.2)
    # prompt = f"{base_prompt} <lora:{lora_filename_no_ext}:{lora_weight}>"
    # --- 结束 LoRA 调用 ---
    prompt = base_prompt # 如果不使用LoRA，直接使用基础提示词

    # 线条示意图风格的负面提示词
    negative_prompt = "photorealistic, photo, photography, 3d render, realistic, detailed texture, intricate details, complex lighting, shadows, messy lines, sketch, painting, blurry, low quality, text, words, person, model, hands, feet, extra objects, deformed, labels, logos"
    
    return prompt, negative_prompt

def queue_prompt(prompt_workflow):
    p = {"prompt": prompt_workflow, "client_id": CLIENT_ID}
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(f"{COMFYUI_URL}/prompt", data=data)
    try:
        response = urllib.request.urlopen(req)
        return json.loads(response.read())
    except urllib.error.URLError as e:
        print(f"Error queuing prompt: {e}")
        if hasattr(e, 'read'):
            print(f"Server response: {e.read().decode()}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response: {e}")
        return None

def get_image(filename, subfolder, folder_type):
    data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    url_values = urllib.parse.urlencode(data)
    try:
        with urllib.request.urlopen(f"{COMFYUI_URL}/view?{url_values}") as response:
            return response.read()
    except urllib.error.URLError as e:
        print(f"Error getting image: {e}")
        return None

def get_history(prompt_id):
    try:
        with urllib.request.urlopen(f"{COMFYUI_URL}/history/{prompt_id}") as response:
            return json.loads(response.read())
    except urllib.error.URLError as e:
        print(f"Error getting history: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding history JSON: {e}")
        return None

def get_images_from_websocket(ws, prompt_id):
    print("Waiting for image generation via WebSocket...")
    while True:
        try:
            out = ws.recv()
            if isinstance(out, str):
                message = json.loads(out)
                if message['type'] == 'executing':
                    data = message['data']
                    if data['node'] is None and data['prompt_id'] == prompt_id:
                        print("Execution finished.")
                        break # Execution is done
                    elif data['prompt_id'] == prompt_id:
                        print(f"Executing node: {data['node']}")
            # We don't need to process binary output from preview nodes here
        except websocket.WebSocketConnectionClosedException:
            print("WebSocket connection closed.")
            break
        except Exception as e:
            print(f"WebSocket error: {e}")
            break

    # After execution, fetch the history to get the output filename
    history = get_history(prompt_id)
    if not history or prompt_id not in history:
        print("Error: Could not retrieve history for the prompt.")
        return None

    # Find the output images in the history
    # Assumes the final output node produces images
    # You might need to adjust this based on your workflow's output node ID
    # Check history[prompt_id]['outputs'] structure
    outputs = history[prompt_id].get('outputs', {})
    for node_id, node_output in outputs.items():
        if 'images' in node_output:
            images_output = node_output['images']
            if images_output:
                # Get the first image's details
                first_image = images_output[0]
                image_data = get_image(first_image['filename'], first_image['subfolder'], first_image['type'])
                print(f"Retrieved image: {first_image['filename']}")
                return image_data # Return the raw image bytes

    print("Error: No image output found in history.")
    return None

def call_comfyui_api(prompt, negative_prompt, seed):
    """
    调用 ComfyUI API
    """
    try:
        # 1. 加载工作流模板 (保存格式)
        with open(WORKFLOW_FILE, 'r', encoding='utf-8') as f:
            prompt_workflow_template = json.load(f)
            print("--- Successfully Loaded Workflow Template JSON (Save Format) ---")
    except Exception as e:
        print(f"Error loading workflow file {WORKFLOW_FILE}: {e}")
        return None

    # 2. 将加载的模板转换为 ComfyUI API Prompt 格式
    api_prompt_payload = {}
    try:
        # 创建链接映射方便查找
        links_map = {link_data[0]: (str(link_data[1]), link_data[2]) \
                     for link_data in prompt_workflow_template.get('links', [])}\
        
        for node in prompt_workflow_template.get("nodes", []):
            node_id_str = str(node.get("id"))
            class_type = node.get("type")
            inputs_dict = {}
            widget_value_index = 0 # 用于从 widgets_values 获取值
            
            node_inputs_list = node.get("inputs", [])
            if node_inputs_list:
                for input_data in node_inputs_list:
                    input_name = input_data.get("name")
                    link_id = input_data.get("link")
                    widget_config = input_data.get("widget")

                    if link_id is not None and link_id in links_map:
                        # 处理链接输入
                        source_node_id, source_output_index = links_map[link_id]
                        inputs_dict[input_name] = [source_node_id, source_output_index]
                    elif widget_config:
                        # 处理控件输入，从 widgets_values 获取值
                        # 注意：这种基于索引的匹配可能不稳定，如果控件顺序改变会出错
                        # 更健壮的方法是解析 widget_config["name"]，但这更复杂
                        widgets_values = node.get("widgets_values")
                        if widgets_values and widget_value_index < len(widgets_values):
                            inputs_dict[input_name] = widgets_values[widget_value_index]
                            widget_value_index += 1
                        else:
                            # 如果 widgets_values 不存在或索引越界，尝试使用 widget 默认值（如果需要）
                            # 或者设置一个默认值，例如 None or 0
                            # print(f"Warning: Could not find widget value for {input_name} in node {node_id_str}")
                            # 简单起见，如果widget_values没有提供，我们先跳过
                            pass
                    # 其他情况（例如可选输入没有连接也没有widget值）可以忽略
            
            api_prompt_payload[node_id_str] = { 
                "class_type": class_type,
                "inputs": inputs_dict
            }
        print("--- Successfully Converted Workflow to API Prompt Format ---")
    except Exception as e:
        print(f"Error converting workflow format: {e}")
        return None

    # 3. 在转换后的 API Prompt 格式中修改特定节点的输入
    #    根据你的 workflow.json:
    #    - 正面提示词节点 ID: 6
    #    - 负面提示词节点 ID: 71
    #    - KSampler 节点 ID: 294
    # 检查必要的节点是否存在于转换后的数据中
    positive_node_id = "6"
    negative_node_id = "71"
    sampler_node_id = "294"

    if positive_node_id not in api_prompt_payload or negative_node_id not in api_prompt_payload or sampler_node_id not in api_prompt_payload:
        print(f"Error: One or more Node IDs ({positive_node_id}, {negative_node_id}, {sampler_node_id}) not found in the converted API prompt structure.")
        print("Please ensure the workflow JSON is loaded correctly, conversion logic is correct, and node IDs are accurate.")
        return None

    try:
        # 检查 inputs 字典是否存在
        if "inputs" not in api_prompt_payload[positive_node_id]:
            api_prompt_payload[positive_node_id]["inputs"] = {}
        api_prompt_payload[positive_node_id]["inputs"]["text"] = prompt
        print(f"Set positive prompt for node {positive_node_id}")

        if "inputs" not in api_prompt_payload[negative_node_id]:
            api_prompt_payload[negative_node_id]["inputs"] = {}
        api_prompt_payload[negative_node_id]["inputs"]["text"] = negative_prompt
        print(f"Set negative prompt for node {negative_node_id}")

        if "inputs" not in api_prompt_payload[sampler_node_id]:
            api_prompt_payload[sampler_node_id]["inputs"] = {}
        api_prompt_payload[sampler_node_id]["inputs"]["seed"] = seed
        print(f"Set seed for node {sampler_node_id}")

        # 显式设置 KSampler (ID: 294) 的其他参数，确保类型和值正确
        # 使用你在 ComfyUI 中测试成功的参数
        try:
            sampler_inputs = api_prompt_payload[sampler_node_id]["inputs"]
            sampler_inputs["steps"] = 40          # 确保是整数
            sampler_inputs["cfg"] = 5.5           # 确保是浮点数
            sampler_inputs["sampler_name"] = "dpmpp_2m" # 确保是有效的字符串
            sampler_inputs["scheduler"] = "sgm_uniform" # 确保是有效的字符串
            sampler_inputs["denoise"] = 1.0         # 确保是浮点数
            print(f"Explicitly set other KSampler parameters for node {sampler_node_id}")
        except KeyError as e:
            print(f"Error setting specific KSampler parameters: missing 'inputs' or specific key? Error: {e}")
            return None
        
    except KeyError as e:
        print(f"Error: Could not set input for node. Missing 'inputs' key or specific input key like 'text' or 'seed'? Error: {e}")
        print("Workflow node structure might be different than expected.")
        # print("Node data:", api_prompt_payload.get(str(e), "Node not found")) # Uncomment to debug node structure
        return None

    # 4. 连接 WebSocket
    ws = websocket.WebSocket()
    try:
        ws.connect(f"ws://{SERVER_ADDRESS}/ws?clientId={CLIENT_ID}")
    except Exception as e:
        print(f"Error connecting to WebSocket: {e}")
        return None

    # 5. 提交转换并修改后的任务到队列
    queue_response = queue_prompt(api_prompt_payload) # 发送 API Prompt 格式的数据
    if not queue_response or 'prompt_id' not in queue_response:
        print("Failed to queue prompt.")
        ws.close()
        return None
    prompt_id = queue_response['prompt_id']
    print(f"Queued prompt with ID: {prompt_id}")

    # 6. 通过 WebSocket 获取生成的图片
    image_data = None
    try:
        image_data = get_images_from_websocket(ws, prompt_id)
    finally:
        ws.close()

    return image_data # 返回图片字节数据 (bytes)

def save_image(image_data, file_path):
    """保存图片字节数据"""
    if not image_data:
        print("Error: No image data received to save.")
        return False
    try:
        # 确保父目录存在
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # 保存图片
        with open(file_path, "wb") as file:
            file.write(image_data)
        
        print(f"图片已保存至: {file_path}")
        return True
    except Exception as e:
        print(f"保存图片出错: {e}")
        return False

# ----- 主函数 -----
def main():
    """主流程"""
    print("=== 服装图片生成程序启动 ===")
    
    # 确保输出目录存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 加载翻译
    translations = load_translations()
    
    # 加载Seed映射
    seed_mapping = load_seed_mapping()
    
    # 获取服装数据
    clothes_data = extract_clothes_data(CLOTHES_DATA_PATH)
    
    # 统计
    total_items = len(clothes_data)
    generated_count = 0
    skipped_count = 0
    failed_count = 0
    
    print(f"\n准备处理 {total_items} 件服装项目\n")
    
    # 遍历每件服装
    for index, item in enumerate(clothes_data):
        item_id = item.get('id')
        if not item_id:
            print("警告: 发现缺少ID的服装项目，已跳过。")
            skipped_count += 1
            continue
        
        print(f"\n--- 处理项目: {item_id} ---")
        
        # 检查图片是否已存在
        img_path = get_file_path(item_id)
        if os.path.exists(img_path):
            print(f"图片已存在，跳过: {img_path}")
            skipped_count += 1
            continue
        
        # 获取或生成 Seed
        if item_id not in seed_mapping:
            seed_mapping[item_id] = random.randint(0, 2**32 - 1)
            print(f"为 {item_id} 生成新 Seed: {seed_mapping[item_id]}")
            save_seed_mapping(seed_mapping) # 生成一个就保存一次，防止中断丢失
            seed = seed_mapping[item_id]
        print(f"使用 Seed: {seed}")
        
        # 生成提示词
        prompt, negative_prompt = generate_prompt(item, translations)
        if not prompt:
            print("错误: 生成提示词失败，跳过。")
            failed_count += 1
            continue
        print(f"正面提示词: {prompt[:100]}...")
        print(f"负面提示词: {negative_prompt[:100]}...")
        
        # 调用 ComfyUI API
        image_data = call_comfyui_api(prompt, negative_prompt, seed)
        
            # 保存图片
        if image_data:
            if save_image(image_data, img_path):
                generated_count += 1
            else:
                failed_count += 1
        else:
            print(f"错误: 未能从API获取 {item_id} 的图片，跳过。")
            failed_count += 1
        
        # 防止请求过于频繁
        print("等待 1 秒...")
        time.sleep(1)
    
    print("\n=== 处理完成 ===")
    print(f"总项目数: {total_items}")
    print(f"成功生成: {generated_count}")
    print(f"跳过(已存在): {skipped_count}")
    print(f"失败: {failed_count}")
    
    # 最后再保存一次完整的Seed映射
    save_seed_mapping(seed_mapping)

if __name__ == "__main__":
    main() 