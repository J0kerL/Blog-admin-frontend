import Cookies from 'js-cookie'

const TokenKey = 'DiamondBlog'

// 设置token到cookie，过期时间1小时
export function setToken(token: string) {
  // 确保token不包含Bearer前缀
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token
  return Cookies.set(TokenKey, tokenValue, { expires: 1/24 }) // 1/24 天 = 1小时
}

export function getToken() {
  return Cookies.get(TokenKey)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
} 