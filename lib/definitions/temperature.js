module.exports = {
  C: {
    label: 'C',
    to_anchor: 1,
    anchor_shift: 0,
    measure: 'temperature',
    transform: function (C) { return C / (5/9) + 32 }
  },
  F: {
    label: 'F',
    to_anchor: 1,
    measure: 'temperature',
    transform: function (F) { return (F - 32) * (5/9) }
  }
};