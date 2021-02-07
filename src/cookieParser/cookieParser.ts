/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * This file has been modified with permission in
 * accordance with the MIT license.
 * @see https://github.com/jshttp/cookie
 */



 
'use strict';

/**
 * Module exports.
 * @public
 */

export const parseCookies = parse;
export const serializeCookies = serialize;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var encode = encodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

interface Options {}

interface ParseOptions extends Options {
    decode?: () => string;
}

export interface SerializeOptions extends Options {
    encode?: () => string;
    /**
     * Number of seconds until the cookie expires.
     * A zero or negative number will expire the cookie immediately.
     * If both Expires and Max-Age are set, Max-Age has precedence.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
     */
    maxAge?: number;
    domain?: string;
    path?: string;
    /**
     * The maximum lifetime of the cookie as an HTTP-date timestamp. See Date
     * for the required formatting.
     *
     * If unspecified, the cookie becomes a session cookie. A session
     * finishes when the client shuts down, and session cookies will be removed.
     *
     * Warning: Many web browsers have a session restore feature that will save all
     * tabs and restore them next time the browser is used. Session cookies will also be restored, as if the browser was never closed.
     *
     * When an Expires date is set, the deadline is relative to the client the cookie
     * is being set on, not the server.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date
     */
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: true | "lax" | "strict" | "none";
}

function parse(str: string, options?: object): object {

    var obj: Record<string, string> = {}
    var opt: ParseOptions = options || {};
    var pairs = str.split(pairSplitRegExp);
    var dec = opt.decode ?? decode;

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf('=');

        // skip things that don't look like key=value
        if (eq_idx < 0) {
            continue;
        }

        var key = pair.substr(0, eq_idx).trim()
        var val = pair.substr(++eq_idx, pair.length).trim();

        // quoted values
        if ('"' == val[0]) {
            val = val.slice(1, -1);
        }

        // only assign once
        if (undefined == obj[key]) {
            obj[key] = tryDecode(val, dec);
        }
    }

    return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name: string, val: string, options: object): string {
    var opt: SerializeOptions = options || {};
    var enc = opt.encode || encode;

    var value = enc(val);

    var str = name + '=' + value;

    if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;

        str += '; Max-Age=' + Math.floor(maxAge);
    }

    if (opt.domain) {
        str += '; Domain=' + opt.domain;
    }

    if (opt.path) {
        str += '; Path=' + opt.path;
    }

    if (opt.expires) {
        str += '; Expires=' + opt.expires.toUTCString();
    }

    if (opt.httpOnly) {
        str += '; HttpOnly';
    }

    if (opt.secure) {
        str += '; Secure';
    }

    if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === 'string'
            ? opt.sameSite.toLowerCase() : opt.sameSite;

        switch (sameSite) {
            case true:
                str += '; SameSite=Strict';
                break;
            case 'lax':
                str += '; SameSite=Lax';
                break;
            case 'strict':
                str += '; SameSite=Strict';
                break;
            case 'none':
                str += '; SameSite=None';
                break;
            default:
                throw new TypeError('option sameSite is invalid');
        }
    }

    return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str: string, decode: (str: string) => string) {
    try {
        return decode(str);
    } catch (e) {
        return str;
    }
}