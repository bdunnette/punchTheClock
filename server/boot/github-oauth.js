var PassportConfigurator =
  require('loopback-component-passport').PassportConfigurator;

module.exports = function(app) {
  var passportConfigurator = new PassportConfigurator(app);

  passportConfigurator.init();
  passportConfigurator.setupModels({
    userModel: app.models.User,
    userIdentityModel: app.models.UserIdentity,
    userCredentialModel: app.models.UserCredential
  });
  passportConfigurator.configureProvider('github-login',
    require('../../providers.json')['github-login']);
  // console.log(passportConfigurator);
};
