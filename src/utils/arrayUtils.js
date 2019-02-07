const deleteArrayElement = function(array, index) {
  const copyArray = array.slice();
  copyArray.copyWithin(index, index + 1);
  copyArray.pop();
  return copyArray;
};

module.exports = { deleteArrayElement };
