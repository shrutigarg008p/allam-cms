export function unflatten(_json: any) {
  function jsonToObj(data: any, result) {
    return Object.keys(data).reduce((acc, current, index) => {
      const inlineKeys = current.split('.');
      let firstProp = inlineKeys.shift();
      const hasProps = inlineKeys.length >= 1;
      if (hasProps) {
        const parsedKey = parseInt(inlineKeys[0], 10);
        const isNextKeyNumber = !isNaN(parsedKey);
        let _nextData = {};
        if (!acc[firstProp]) {
          acc[firstProp] = isNextKeyNumber ? [] : {};
        }
        if (isNextKeyNumber) {
          const _index = parseInt(inlineKeys.shift(), 10);
          const isValueInArray = acc[firstProp].length - 1 >= _index;
          const currentValueObj = acc[firstProp][_index];
          _nextData[inlineKeys.join('.')] = data[current];
          acc[firstProp][_index] = isValueInArray
            ? Object.assign(currentValueObj, jsonToObj(_nextData, currentValueObj))
            : jsonToObj(_nextData, {});
        } else {
          _nextData[inlineKeys.join('.')] = data[current];
          Object.assign(acc[firstProp], jsonToObj(_nextData, acc[firstProp]));
        }
      } else {
        acc[firstProp] = data[current];
      }
      return acc;
    }, result);
  }
  return jsonToObj(_json, {});
};
