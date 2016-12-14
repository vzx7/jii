/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */
'use strict';

var Jii = require('../BaseJii');
var Event = require('../base/Event');
class LogEvent extends Event {

    preInit() {
        /**
     * Log message
     * @type {string}
     */
        this.message = null;
        /**
     * Level: debug/info/warning/error
     * @type {string}
     */
        this.level = null;
        super.preInit(...arguments);
    }

}
module.exports = LogEvent;