
/**
 * @imports
 */
import _objFrom from '@onephrase/util/obj/from.js';
import _isArray from '@onephrase/util/js/isArray.js';
import _isNumeric from '@onephrase/util/js/isNumeric.js';
import _isClass from '@onephrase/util/js/isClass.js';
import _isFunction from '@onephrase/util/js/isFunction.js';
import _isTypeObject from '@onephrase/util/js/isTypeObject.js';
import closure from '../observer/closure.js';
import getInterceptors from './getInterceptors.js';

/**
 * Runs a "get" query operation on a subject.
 * Fires any such query observers that may be bound to subject.
 *
 * @param array|object	subject
 * @param string|array	keys
 * @param bool			autoClosures
 *
 * @return mixed
 */
export default function(subject, keys, autoClosures = false) {
	if (!subject || !_isTypeObject(subject)) {
		throw new Error('Target must be of type object!');
	}
	// ---------------------------------
	// Execute any "get" traps, otherwise "get" the default way
	var value, interceptors, defaultGet = function(_value) {
		return arguments.length ? _value : (_isArray(keys) ? _objFrom(keys, subject) : subject[keys]);
	};
	if (interceptors = getInterceptors(subject)) {
		value = interceptors.fire({type:'get', name:keys}, defaultGet);
	} else {
		value = defaultGet();
	}
	// ---------------------------------
	// Execute array methods in "mutation" mode
	if (autoClosures && _isArray(subject) && !_isNumeric(keys) && _isFunction(value) && !_isClass(value)) {
		return function observerArrayMethodWrapper(...args) {
			return closure(() => {
				return value.apply(subject, args);
			}, subject);
		};
	}
	return value;
}
