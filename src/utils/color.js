/**
 * 将 HEX 十六进制颜色值转换为 RGB 或 RGBA 颜色值。
 * @param {string} hex - HEX 颜色值，格式如 "#RRGGBB" 或 "#RRGGBBAA"。
 * @param {number} [alpha] - 可选的透明度值 (0~1)，用于返回 RGBA 格式。
 * @returns {string} RGB 或 RGBA 颜色值字符串。
 */
export const hexToRgb = (hex, alpha) => {
    // 去掉前导 # 符号
    hex = hex.replace(/^#/, '');

    // 确保 HEX 值有效 (必须是 3、4、6 或 8 位)
    if (![3, 4, 6, 8].includes(hex.length)) {
        throw new Error("Invalid HEX color.");
    }

    // 将 3 位 HEX 值转换为 6 位
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    // 将 4 位 HEX 值转换为 8 位 (包含 Alpha)
    else if (hex.length === 4) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // 提取 RGB 和 Alpha 值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : alpha;

    // 返回 RGB 或 RGBA 格式字符串
    return a !== undefined ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
}


// 示例用法
// console.log(hexToRgb("#FF5733"));           // 输出: "rgb(255, 87, 51)"
// console.log(hexToRgb("#FF5733", 0.5));      // 输出: "rgba(255, 87, 51, 0.5)"
// console.log(hexToRgb("#FF573380"));         // 输出: "rgba(255, 87, 51, 0.5)"
// console.log(hexToRgb("#abc"));              // 输出: "rgb(170, 187, 204)"
