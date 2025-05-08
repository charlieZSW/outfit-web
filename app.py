import logging
from flask import Flask, render_template
from livereload import Server

app = Flask(__name__)

# --- 日志配置 (根据 logging.mdc) ---
if not app.debug:
    # 生产环境可以配置更详细的日志
    log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    # 例如: 添加文件处理器
    # import logging.handlers
    # file_handler = logging.handlers.RotatingFileHandler('app.log', maxBytes=10240, backupCount=10)
    # file_handler.setFormatter(log_formatter)
    # file_handler.setLevel(logging.INFO)
    # app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
else:
    # 开发环境使用 DEBUG 级别
    app.logger.setLevel(logging.DEBUG)

app.logger.info('Flask app starting...')

# --- 路由 --- 
@app.route('/')
def index():
    """渲染主页面 index.html"""
    app.logger.debug('Accessing index route /')
    return render_template('index.html')

# --- 错误处理 (根据 error-handling.mdc) ---
@app.errorhandler(404)
def page_not_found(error):
    """处理 404 错误"""
    app.logger.warning(f"Page not found: {error}", exc_info=True)
    # 可以渲染一个自定义的 404 页面模板
    # return render_template('404.html'), 404
    return "<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>", 404

@app.errorhandler(500)
def internal_server_error(error):
    """处理 500 错误"""
    app.logger.error(f"Internal server error: {error}", exc_info=True)
    # 可以渲染一个自定义的 500 页面模板
    # return render_template('500.html'), 500
    return "<h1>500 Internal Server Error</h1><p>Something went wrong on the server.</p>", 500

# --- 运行 --- 
if __name__ == '__main__':
    # 恢复使用 Flask 内置的 debug 模式运行
    app.run(debug=True) 
    # # 使用 livereload Server 替代 app.run (注释掉或删除)
    # # server = Server(app.wsgi_app)
    # # server.watch('**/*.py')
    # # server.watch('templates/')
    # # server.watch('static/')
    # # server.serve(port=5000, open_url_delay=1)