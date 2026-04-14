module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nesting'), // MUST come before tailwindcss
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};