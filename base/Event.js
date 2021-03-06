/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

const Jii = require('../BaseJii');
const ApplicationException = require('../exceptions/ApplicationException');
const _isObject = require('lodash/isObject');
const _isArray = require('lodash/isArray');
const _isFunction = require('lodash/isFunction');
const _isString = require('lodash/isString');
const _isUndefined = require('lodash/isUndefined');
const _has = require('lodash/has');
const BaseObject = require('./BaseObject');

class Event extends BaseObject {

    preInit() {
        this.params = {};

        /**
         * @var {*} the data that is passed to [[on()]] when attaching an event handler.
         * Note that this varies according to which event handler is currently executing.
         */
        this.data = null;

        /**
         * @var {boolean} whether the event is handled. Defaults to false.
         * When a handler sets this to be true, the event processing will stop and
         * ignore the rest of the uninvoked event handlers.
         */
        this.handled = false;

        /**
         * @var {object} the sender of this event. If not set, this property will be
         * set as the object whose "trigger()" method is called.
         * This property may also be a `null` when this event is a
         * class-level event which is triggered in a static context.
         */
        this.sender = null;

        /**
         * @var {string} the event name. This property is set by [[trigger()]] and [[trigger()]].
         * Event handlers may use this property to check what event it is handling.
         */
        this.name = null;

        super.preInit(...arguments);
    }

    /**
     * Convert string/function/object to object handler with context and callback params
     * @param {string|function|object|[]} handler
     * @param {object} [context]
     * @returns {{context: object, callback: function}}
     */
    static normalizeHandler(handler, context) {
        context = context || null;

        if (!handler) {
            return null;
        }

        if (_isObject(handler) && _has(handler, 'callback') && _has(handler, 'context')) {
            return handler;
        }

        if (_isArray(handler) && handler.length === 2) {
            if (_isFunction(handler[0]) && _isObject(handler[1])) {
                return {
                    context: handler[1],
                    callback: handler[0]
                };
            }

            if (_isString(handler[0])) {
                handler[0] = Jii.namespace(handler[0]);
            }
            return {
                context: handler[0],
                callback: handler[0][handler[1]]
            };
        }

        if (_isString(handler)) {
            return {
                context: context,
                callback: this[handler]
            };
        }

        if (_isFunction(handler)) {
            return {
                context: context,
                callback: handler
            };
        }

        throw new ApplicationException('Wrong handler format:' + JSON.stringify(handler));
    }

    /**
     * Attaches an event handler to a class-level event.
     *
     * When a class-level event is triggered, event handlers attached
     * to that class and all parent classes will be invoked.
     *
     * For example, the following code attaches an event handler to `ActiveRecord`'s
     * `afterInsert` event:
     *
     * ~~~
     * on(ActiveRecord, ActiveRecord.EVENT_AFTER_INSERT, function (event) {
         *     console.log(event.sender.className() + ' is inserted.');
         * });
     * ~~~
     *
     * The handler will be invoked for EVERY successful ActiveRecord insertion.
     *
     * For more details about how to declare an event handler, please refer to [[on()]].
     *
     * @param {function|string} cls the fully qualified class name to which the event handler needs to attach.
     * @param {string} name the event name.
     * @param {string|function|object} handler the event handler.
     * @param {*} [data] the data to be passed to the event handler when the event is triggered.
     * When the event handler is invoked, this data can be accessed via [[data]].
     * @param {boolean} [isAppend] whether to append new event handler to the end of the existing
     * handler list. If false, the new handler will be inserted at the beginning of the existing
     * handler list.
     * @see off()
     */
    static on(cls, name, handler, data, isAppend) {
        data = data || null;
        isAppend = _isUndefined(isAppend) ? true : isAppend;

        if (_isString(cls)) {
            cls = Jii.namespace(cls);
        }

        handler = this.normalizeHandler(handler);

        if (isAppend || !this._events || !this._events[name]) {
            this._events = this._events || {};
            this._events[name] = this._events[name] || [];

            if (!this._events[name].find(item => item[0] === cls)) {
                this._events[name].push([
                    cls,
                    handler,
                    data
                ]);
            }
        } else {
            this._events[name].unshift([
                cls,
                handler,
                data
            ]);
        }
    }

    /**
     * Detaches an event handler from a class-level event.
     *
     * This method is the opposite of [[on()]].
     *
     * @param {function|string} cls the fully qualified class name from which the event handler needs to be detached.
     * @param {string} name the event name.
     * @param {string|function|object} [handler] the event handler to be removed.
     * If it is null, all handlers attached to the named event will be removed.
     * @return boolean whether a handler is found and detached.
     * @see on()
     */
    static off(cls, name, handler) {
        handler = handler || null;

        if (_isString(cls)) {
            cls = Jii.namespace(cls);
        }

        handler = this.normalizeHandler(handler);

        if (!this._events || !this._events[name]) {
            return false;
        }

        const previousLength = this._events[name].length;

        this._events[name] = this._events[name].filter(item => {
            return item[0] !== cls && (!handler || item[1].callback === handler.callback);
        });
        return this._events[name].length !== previousLength;
    }

    /**
     * Returns a value indicating whether there is any handler attached to the specified class-level event.
     * Note that this method will also check all parent classes to see if there is any handler attached
     * to the named event.
     * @param {string|object} cls the object or the fully qualified class name specifying the class-level event.
     * @param {string} name the event name.
     * @return boolean whether there is any handler attached to the event.
     */
    static hasHandlers(cls, name) {
        if (!this._events || !this._events[name]) {
            return false;
        }

        if (_isString(cls)) {
            cls = Jii.namespace(cls);
        }

        while (true) {
            if (this._events[name].find(item => item[0] === cls)) {
                return true;
            }

            cls = Object.getPrototypeOf(cls);
            if (!cls) {
                break;
            }
        }

        return false;
    }

    /**
     * Triggers a class-level event.
     * This method will cause invocation of event handlers that are attached to the named event
     * for the specified class and all its parent classes.
     * @param {object|function} cls the object or the fully qualified class name specifying the class-level event.
     * @param {string} name the event name.
     * @param {Event} [event] the event parameter. If not set, a default [[Event]] object will be created.
     */
    static trigger(cls, name, event) {
        event = event || null;

        if (!this._events || !this._events[name]) {
            return;
        }

        if (event === null) {
            event = new this();
        }

        event.handled = false;
        event.name = name;

        if (_isString(cls)) {
            cls = Jii.namespace(cls);
        }

        if (_isObject(cls) && event.sender === null) {
            event.sender = cls;
        }

        if (_isObject(cls)) {
            cls = cls.constructor;
        }

        while (true) {

            let isHandled = false;
            this._events[name].forEach(item => {
                if (isHandled || item[0] !== cls) {
                    return;
                }

                event.data = item[2];
                item[1].callback.call(item[1].context, event);

                isHandled = event.handled;
            });

            if (isHandled) {
                return;
            }

            cls = Object.getPrototypeOf(cls);
            if (!cls) {
                break;
            }
        }
    }

}

Event._events = {};
module.exports = Event;