function throwValueError (value) {
	if (value !== null && typeof value !== 'function') {
		throw new Error('observe-visibility directive expects a function as the value')
	}
}

function parseThresholds (thresholds = '0') {
	return (thresholds.indexOf(',') > -1 ? thresholds.split(',') : [thresholds]).map(n => validateThreshold(n))
}

function validateThreshold (threshold) {
	threshold = parseInt(threshold)
	if (threshold > 100 || threshold < 0) {
		throw new Error('threshold must be beween 0 and 100, or omitted')
	}
	return isNaN(threshold) ? 0 : threshold / 100
}

export default {
	bind (el, { value, arg }, vnode) {
		if (typeof IntersectionObserver === 'undefined') {
			console.warn('[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/WICG/IntersectionObserver/tree/gh-pages/polyfill')
		} else {
			throwValueError(value)
			el._vue_visibilityCallback = value
			const thresholds = parseThresholds(arg)
			const observer = el._vue_intersectionObserver = new IntersectionObserver(entries => {
				var entry = entries[0]
				if (el._vue_visibilityCallback) {
					el._vue_visibilityCallback.call(null, entry.intersectionRatio > thresholds[0], entry)
				}
			}, { threshold: thresholds })
			// Wait for the element to be in document
			vnode.context.$nextTick(() => {
				observer.observe(el)
			})
		}
	},
	update (el, { value }) {
		throwValueError(value)
		el._vue_visibilityCallback = value
	},
	unbind (el) {
		if (el._vue_intersectionObserver) {
			el._vue_intersectionObserver.disconnect()
			delete el._vue_intersectionObserver
			delete el._vue_visibilityCallback
		}
	},
}
