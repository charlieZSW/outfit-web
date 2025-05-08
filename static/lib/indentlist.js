// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var Pos = CodeMirror.Pos;
  
  // 改进的正则表达式，更准确地匹配列表标记
  // 匹配: >引用, */-/+无序列表, 1.有序列表
  var listTokenRE = /^(\s*)((?:>+\s+)|(?:[-*+]\s+)|(?:\d+\.\s+))/;
  
  // 检查空行的正则表达式
  var emptyLineRE = /^\s*$/;
  
  // 提取列表标记类型的函数，返回标记类型（引用、无序列表、有序列表）和缩进级别
  function getListType(line) {
    var match = listTokenRE.exec(line);
    if (!match) return null;
    
    var indent = match[1].length;
    var marker = match[2];
    
    var type = null;
    if (marker.indexOf('>') >= 0) {
      type = 'blockquote';
    } else if (marker.match(/[-*+]\s+/)) {
      type = 'unordered';
    } else if (marker.match(/\d+\.\s+/)) {
      type = 'ordered';
    }
    
    return {
      type: type,
      indent: indent,
      marker: marker,
      fullMatch: match[0]
    };
  }
  
  // 检查光标是否在列表项中的函数
  function isCursorInList(cm, pos) {
    var line = cm.getLine(pos.line);
    var listInfo = getListType(line);
    
    // 不是列表，直接返回false
    if (!listInfo) return false;
    
    // 如果光标在行的开始部分，且在列表标记的范围内，也算在列表中
    if (pos.ch <= listInfo.fullMatch.length) return true;
    
    // 如果光标在列表标记之后，也算在列表中
    return pos.ch > listInfo.fullMatch.length;
  }
  
  // 检查光标是否恰好在列表标记后的函数
  function isCursorAfterListMarker(cm, pos) {
    var line = cm.getLine(pos.line);
    var listInfo = getListType(line);
    
    // 不是列表，直接返回false
    if (!listInfo) return false;
    
    // 光标必须恰好在列表标记的末尾
    return pos.ch === listInfo.fullMatch.length;
  }
  
  // 检查当前行是否是空列表项
  function isEmptyListItem(cm, pos) {
    var line = cm.getLine(pos.line);
    var listInfo = getListType(line);
    
    // 不是列表，直接返回false
    if (!listInfo) return false;
    
    // 检查列表标记后面是否为空
    var textAfterMarker = line.slice(listInfo.fullMatch.length);
    return emptyLineRE.test(textAfterMarker);
  }
  
  // 自动缩进Markdown列表
  CodeMirror.commands.autoIndentMarkdownList = function(cm) {
    if (cm.getOption("disableInput")) return CodeMirror.Pass;
    
    var ranges = cm.listSelections();
    var processed = false;
    
    for (var i = 0; i < ranges.length; i++) {
      var pos = ranges[i].head;
      
      // 只处理光标所在位置，不处理选择范围
      if (!ranges[i].empty()) continue;
      
      // 检查是否在列表项中并且光标位于适当的位置
      if (isCursorInList(cm, pos)) {
        var line = cm.getLine(pos.line);
        var listInfo = getListType(line);
        
        // 确保是在列表标记后面或Tab键按下时处于列表项的开始
        if (isCursorAfterListMarker(cm, pos) || (pos.ch <= listInfo.fullMatch.length && pos.ch > 0)) {
          cm.indentLine(pos.line, "add");
          processed = true;
        }
      }
    }
    
    return processed ? undefined : CodeMirror.Pass;
  };
  
  // 自动减少Markdown列表的缩进
  CodeMirror.commands.autoUnindentMarkdownList = function(cm) {
    if (cm.getOption("disableInput")) return CodeMirror.Pass;
    
    var ranges = cm.listSelections();
    var processed = false;
    
    cm.operation(function() {
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].head;
        
        // 只处理光标所在位置，不处理选择范围
        if (!ranges[i].empty()) continue;
        
        // 检查是否在列表项中
        if (isCursorInList(cm, pos)) {
          var line = cm.getLine(pos.line);
          var listInfo = getListType(line);
          
          if (listInfo) {
            // 如果有缩进，减少缩进
            if (listInfo.indent > 0) {
              cm.indentLine(pos.line, "subtract");
              processed = true;
            } else if (isEmptyListItem(cm, pos)) {
              // 如果是空列表项且没有缩进，删除整个列表标记
              cm.replaceRange("", 
                { line: pos.line, ch: 0 }, 
                { line: pos.line, ch: listInfo.fullMatch.length }
              );
              processed = true;
            }
          }
        }
      }
    });
    
    return processed ? undefined : CodeMirror.Pass;
  };
  
  // 处理Enter键在列表中的行为
  CodeMirror.commands.newlineAndIndentContinueMarkdownList = function(cm) {
    if (cm.getOption("disableInput")) return CodeMirror.Pass;
    
    var ranges = cm.listSelections();
    var replaces = [];
    
    for (var i = 0; i < ranges.length; i++) {
      var pos = ranges[i].head;
      
      if (!ranges[i].empty()) continue;
      
      var line = cm.getLine(pos.line);
      var listInfo = getListType(line);
      
      if (!listInfo) {
        // 如果不在列表中，使用默认的换行行为
        return CodeMirror.Pass;
      }
      
      var textAfterMarker = line.slice(listInfo.fullMatch.length);
      var indentation = line.slice(0, listInfo.indent);
      
      if (pos.ch <= listInfo.fullMatch.length) {
        // 如果光标在列表标记内，按Enter应插入新行，但不继续列表
        replaces.push({
          from: {line: pos.line, ch: pos.ch},
          to: {line: pos.line, ch: pos.ch},
          text: "\n" + indentation
        });
      } else if (emptyLineRE.test(textAfterMarker)) {
        // 如果是空列表项，按Enter应结束列表
        replaces.push({
          from: {line: pos.line, ch: 0},
          to: {line: pos.line, ch: line.length},
          text: indentation
        });
      } else {
        // 否则，继续列表（创建新的列表项）
        var newIndentation = indentation;
        var newMarker = listInfo.marker;
        
        // 对于有序列表，自动递增数字
        if (listInfo.type === 'ordered') {
          var numMatch = listInfo.marker.match(/(\d+)\.\s+/);
          if (numMatch) {
            var num = parseInt(numMatch[1], 10);
            newMarker = newMarker.replace(/\d+/, num + 1);
          }
        }
        
        replaces.push({
          from: {line: pos.line, ch: pos.ch},
          to: {line: pos.line, ch: pos.ch},
          text: "\n" + newIndentation + newMarker
        });
      }
    }
    
    // 应用所有替换
    if (replaces.length > 0) {
      cm.operation(function() {
        for (var i = replaces.length - 1; i >= 0; i--) {
          var replace = replaces[i];
          cm.replaceRange(replace.text, replace.from, replace.to);
        }
      });
      return;
    }
    
    return CodeMirror.Pass;
  };
}); 