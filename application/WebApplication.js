/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

const Jii = require('../BaseJii');
const Application = require('../base/Application');

class WebApplication extends Application {

    preInit() {
        super.preInit(...arguments);

        this.defaultRoute = 'site';

        /**
         * @var {string|boolean} the layout that should be applied for views in this application. Defaults to 'main'.
         * If this is false, layout will be disabled.
         */
        this.layout = 'main';
    }

    _preInit(config) {
        super._preInit(config);

        // Set default webroot
        this.setWebPath(config.webPath || this.getBasePath() + '/web');
        this.setWebUrl(config.webUrl || '/');
    }

    /**
     * @return {String}
     */
    getWebPath() {
        return Jii.getAlias('@webroot');
    }

    /**
     * @param  {String} path
     */
    setWebPath(path) {
        Jii.setAlias('@webroot', path);
    }

    /**
     * @return {String}
     */
    getWebUrl() {
        return Jii.getAlias('@web');
    }

    /**
     * @param  {String} path
     */
    setWebUrl(path) {
        Jii.setAlias('@web', path);
    }

}
module.exports = WebApplication;