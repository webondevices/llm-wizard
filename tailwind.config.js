module.exports = {
  mode: 'false',
  content: [
  ],
  safelist: [{
    pattern: /./, // This matches everything
    variants: ['hover', 'focus', 'active', 'disabled', 'first', 'last', 'odd', 'even'], // Include common variants too
  }],
}
