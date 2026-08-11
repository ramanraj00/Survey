export function isFormEmpty(data) {
  if (data === null || data === undefined || data === "") return true;
  
  if (Array.isArray(data)) {
    return data.length === 0 || data.every(isFormEmpty);
  }
  
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return true;
    return Object.values(data).every(isFormEmpty);
  }
  
  return false;
}
