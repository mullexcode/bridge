export function desensitization(
  str: string | undefined | null,
  beginLen = 4,
  endLen = -4,
  fillingLen = 4
) {
  if (str === "null") return "null";
  if (!str) return "";
  let tempStr = "";
  const len = str.length;
  const firstStr = str.substring(0, beginLen);
  const lastStr = str.substring(len + endLen, len);
  const middleStr = str
    .substring(beginLen, beginLen + fillingLen)
    .replace(/[\s\S]/gi, ".");
  tempStr = firstStr + middleStr + lastStr;
  return tempStr;
}

export const isIos = () => {
  const u = navigator.userAgent;
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
};

export const generateSalt = (length: number) => {
  // 确保length是一个正整数
  length = Math.ceil(length);
  // 生成一个指定长度的随机字符串
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const salts = [];
  for (let i = 0; i < length; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    salts.push(chars[randomNumber]);
  }
  return salts.join("");
};

export function getQueryString(name: string) {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  const r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return null;
}