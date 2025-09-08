module.exports = {
  default: {
     require: ['e2e/support/world.cjs', 'e2e/step_definitions/*.cjs'],
    format: ['progress', 'json:e2e/reports/cucumber_report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    paths: ['e2e/features/*.feature'],
    publishQuiet: true
  }
};
