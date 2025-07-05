const TokenKey = 'Blog-Token'

// 设置token到localStorage，提高稳定性
export function setToken(token: string) {
  try {
    localStorage.setItem(TokenKey, token)
    // 立即验证token是否设置成功
    const savedToken = localStorage.getItem(TokenKey)
    return true
  } catch (error) {
    return false
  }
}

export function getToken() {
  try {
    const token = localStorage.getItem(TokenKey)
    return token
  } catch (error) {
    return null
  }
}

export function removeToken() {
  try {
    localStorage.removeItem(TokenKey)
    return true
  } catch (error) {
    return false
  }
}