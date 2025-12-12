const chalk = require('chalk');
const figlet = require('figlet');
const clear = require('clear');
const boxen = require('boxen');

class ConsoleUI {
  constructor() {
    // 颜色定义
    this.colors = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.blue,
      success: chalk.green,
      debug: chalk.gray,
      highlight: chalk.cyan,
      muted: chalk.dim
    };
    
    // 图标定义
    this.icons = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      success: '✅',
      debug: '🐛',
      download: '📥',
      repo: '📦',
      release: '🚀',
      tag: '🏷️',
      search: '🔍',
      refresh: '🔄',
      status: '📊'
    };
  }
  
  clear() {
    clear();
  }
  
  showBanner() {
    console.log('\n');
    console.log(chalk.cyan(figlet.textSync('GitHub Proxy', { horizontalLayout: 'full' })));
    console.log(chalk.cyan.bold('  GitHub Releases 代理服务 v1.0.0\n'));
    console.log(chalk.dim('  输入 "help" 查看可用命令\n'));
  }
  
  log(message, icon = '') {
    console.log(`${icon} ${message}`);
  }
  
  error(message) {
    console.log(`${this.icons.error} ${this.colors.error(message)}`);
  }
  
  warn(message) {
    console.log(`${this.icons.warn} ${this.colors.warn(message)}`);
  }
  
  info(message) {
    console.log(`${this.icons.info} ${this.colors.info(message)}`);
  }
  
  success(message) {
    console.log(`${this.icons.success} ${this.colors.success(message)}`);
  }
  
  debug(message) {
    if (process.env.DEBUG === 'true') {
      console.log(`${this.icons.debug} ${this.colors.debug(message)}`);
    }
  }
  
  highlight(message) {
    console.log(`${this.colors.highlight(message)}`);
  }
  
  table(headers, rows) {
    // 简单的表格输出
    const columnWidths = headers.map((header, index) => {
      const columnValues = rows.map(row => String(row[index] || ''));
      const maxLength = Math.max(
        String(header).length,
        ...columnValues.map(value => value.length)
      );
      return maxLength;
    });
    
    // 打印表头
    let headerRow = '';
    headers.forEach((header, index) => {
      headerRow += header.padEnd(columnWidths[index] + 2);
    });
    console.log(this.colors.highlight(headerRow));
    
    // 打印分隔线
    let separator = '';
    columnWidths.forEach(width => {
      separator += '-'.repeat(width + 2);
    });
    console.log(this.colors.muted(separator));
    
    // 打印数据行
    rows.forEach(row => {
      let rowStr = '';
      row.forEach((cell, index) => {
        rowStr += String(cell).padEnd(columnWidths[index] + 2);
      });
      console.log(rowStr);
    });
  }
  
  box(message, options = {}) {
    const defaultOptions = {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    };
    
    console.log(boxen(message, { ...defaultOptions, ...options }));
  }
  
  progress(message, current, total) {
    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filledLength = Math.round((current / total) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(`\r${message} [${bar}] ${percentage}% (${current}/${total})`);
    
    if (current === total) {
      process.stdout.write('\n');
    }
  }
}

// 如果没有安装 chalk 等包，提供降级方案
try {
  require.resolve('chalk');
} catch (error) {
  console.warn('警告: chalk 包未安装，使用降级输出');
  
  class FallbackUI extends ConsoleUI {
    constructor() {
      super();
      // 覆盖颜色方法为无颜色版本
      Object.keys(this.colors).forEach(key => {
        this.colors[key] = (text) => text;
      });
    }
  }
  
  module.exports = { ConsoleUI: FallbackUI };
} else {
  module.exports = { ConsoleUI };
}