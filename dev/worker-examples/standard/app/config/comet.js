/**
 *
 * @param {Jii.application.Environment} environment
 */
module.exports = function (environment) {
    return {
        workers: environment.isBetaOrProduction() ? 2 : 1,
        application: {
            components: {
                comet: {
                    className: 'Jii.comet.server.Server'
                }
            }
        }
    }
};