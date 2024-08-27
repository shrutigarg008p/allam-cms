export function flatten(_json: any) {
  function objToJson (key, obj) {
    return Object.keys(obj).reduce((acc, current, index) => {
      const _key = '' !== key ? `${key}.${current}` : `${current}`;
      const currentValue = obj[current];
      if (Array.isArray(currentValue) || Object(currentValue) === currentValue) {
        Object.assign(acc, objToJson(_key, currentValue));
      } else {
        acc[_key] = currentValue;
      }
      return acc;
    }, {});
  };
  return objToJson('', _json);
};