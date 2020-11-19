import applyToastr from './mixin'
import $ from './util'

let toastType = {
  error: 'error',
  info: 'info',
  success: 'success',
  warning: 'warning'
};

let toastDefaultOption = {
  tapToDismiss: true,
  toastClass: 'toastr',
  containerId: 'toastr-container',
  debug: false,

  showMethod: 'fadeIn', //fadeIn, slideDown, and show are built into jQuery
  showDuration: 300,
  showEasing: 'swing', //swing and linear are built into jQuery
  onShown: undefined,
  hideMethod: 'fadeOut',
  hideDuration: 1000,
  hideEasing: 'swing',
  onHidden: undefined,
  closeMethod: false,
  closeDuration: false,
  closeEasing: false,
  closeOnHover: true,

  extendedTimeOut: 1000,
  iconClasses: {
    error: 'toastr-error',
    info: 'toastr-info',
    success: 'toastr-success',
    warning: 'toastr-warning'
  },
  iconClass: 'toastr-info',
  positionClass: 'toastr-top-right',
  timeOut: 5000, // Set timeOut and extendedTimeOut to 0 to make it sticky
  titleClass: 'toastr-title',
  messageClass: 'toastr-message',
  escapeHtml: false,
  target: 'body',
  closeHtml: '<button type="button">&times;</button>',
  closeClass: 'toastr-close-button',
  newestOnTop: true,
  preventDuplicates: false,
  progressBar: false,
  progressClass: 'toastr-progress',
  rtl: false
};

let Vue // bind on install

export class Toastr {
  constructor(options = {}) {
    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    console.log('init toastr');
    this.options = {
      ...toastDefaultOption,
      ...options
    };

    // 初始化控制器
    let $container = $("<div id='toastr-container'/>").attr('id', this.options.containerId).addClass(this.options.positionClass);
    document.body.appendChild($container.$element[0]);
    this.$container = $container;

    // 绑定方法
    const toastr = this
    const {
      clear,
      remove,
      error,
      info,
      success,
      subscribe,
      warning
    } = this;
    this.clear = function boundClear(toastElement, clearOptions) {
      return clear.call(toastr, toastElement, clearOptions)
    }
    this.remove = function boundRemove(toastElement) {
      return remove.call(toastr, toastElement)
    }
    this.info = function boundInfo(message, title, optionsOverride) {
      return info.call(toastr, message, title, optionsOverride)
    }
    this.success = function boundSuccess(message, title, optionsOverride) {
      return success.call(toastr, message, title, optionsOverride)
    }
    this.error = function boundError(message, title, optionsOverride) {
      return error.call(toastr, message, title, optionsOverride)
    }
    this.warning = function boundWarning(message, title, optionsOverride) {
      return warning.call(toastr, message, title, optionsOverride)
    }
    this.subscribe = function boundSubscribe(callback) {
      return subscribe.call(toastr, callback)
    }
  }
  info(message, title, optionsOverride) {
    return notify.call(this,{
      type: toastType.info,
      iconClass: this.options.iconClasses.info,
      message: message,
      optionsOverride: optionsOverride,
      title: title
    });
  }
  success(message, title, optionsOverride) {
    return notify.call(this,{
      type: toastType.success,
      iconClass: this.options.iconClasses.success,
      message: message,
      optionsOverride: optionsOverride,
      title: title
    });
  }
  error(message, title, optionsOverride) {
    return notify.call(this,{
      type: toastType.error,
      iconClass: this.options.iconClasses.error,
      message: message,
      optionsOverride: optionsOverride,
      title: title
    });
  }
  warning(message, title, optionsOverride) {
    return notify.call(this,{
      type: toastType.warning,
      iconClass: this.options.iconClasses.warning,
      message: message,
      optionsOverride: optionsOverride,
      title: title
    });
  }
  clear(toastElement, clearOptions) {

  }
  remove(toastElement) {

  }
  subscribe(callback) {
    listener = callback;
  }
}

let listener;
let toastId = 0;
let previousToast;

function removeToast(e){
  e.remove();
}
function publish(e){
  if(!!listener){
    listener(e);
  }
}

function notify(map) {
  var options = this.options;
  var iconClass = map.iconClass || options.iconClass;

  if (typeof (map.optionsOverride) !== 'undefined') {
    options = {...options,...map.optionsOverride};
    iconClass = map.optionsOverride.iconClass || iconClass;
  }

  if (shouldExit(options, map)) {
    return;
  }

  toastId++;

  let $container = this.$container;

  var intervalId = null;
  var $toastElement = $('<div/>');
  var $titleElement = $('<div/>');
  var $messageElement = $('<div/>');
  var $progressElement = $('<div/>');
  var $closeElement = $(options.closeHtml);
  var progressBar = {
    intervalId: null,
    hideEta: null,
    maxHideTime: null
  };
  var response = {
    toastId: toastId,
    state: 'visible',
    startTime: new Date(),
    options: options,
    map: map
  };

  personalizeToast();

  displayToast();

  handleEvents();

  publish(response);

  if (options.debug && console) {
    console.log(response);
  }

  return $toastElement;

  function escapeHtml(source) {
    if (source == null) {
      source = '';
    }

    return source
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function personalizeToast() {
    setIcon();
    setTitle();
    setMessage();
    setCloseButton();
    setProgressBar();
    setRTL();
    setSequence();
    setAria();
  }

  function setAria() {
    var ariaValue = '';
    switch (map.iconClass) {
      case 'toastr-success':
      case 'toastr-info':
        ariaValue = 'polite';
        break;
      default:
        ariaValue = 'assertive';
    }
    $toastElement.attr('aria-live', ariaValue);
  }

  function handleEvents() {
    if (options.closeOnHover) {
      $toastElement.hover(stickAround, delayedHideToast);
    }

    if (!options.onclick && options.tapToDismiss) {
      $toastElement.click(hideToast);
    }

    if (options.closeButton && $closeElement) {
      $closeElement.click(function (event) {
        if (event.stopPropagation) {
          event.stopPropagation();
        } else if (event.cancelBubble !== undefined && event.cancelBubble !== true) {
          event.cancelBubble = true;
        }

        if (options.onCloseClick) {
          options.onCloseClick(event);
        }

        hideToast(true);
      });
    }

    if (options.onclick) {
      $toastElement.click(function (event) {
        options.onclick(event);
        hideToast();
      });
    }
  }

  function displayToast() {
    $toastElement.hide();

    $toastElement[options.showMethod]({
      duration: options.showDuration,
      easing: options.showEasing,
      complete: options.onShown
    });

    if (options.timeOut > 0) {
      intervalId = setTimeout(hideToast, options.timeOut);
      progressBar.maxHideTime = parseFloat(options.timeOut);
      progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
      if (options.progressBar) {
        progressBar.intervalId = setInterval(updateProgress, 10);
      }
    }
  }

  function setIcon() {
    if (map.iconClass) {
      $toastElement.addClass(options.toastClass).addClass(iconClass);
    }
  }

  function setSequence() {
    if (options.newestOnTop) {
      $container.prepend($toastElement);
    } else {
      $container.append($toastElement);
    }
  }

  function setTitle() {
    if (map.title) {
      var suffix = map.title;
      if (options.escapeHtml) {
        suffix = escapeHtml(map.title);
      }
      $titleElement.append(suffix).addClass(options.titleClass);
      $toastElement.append($titleElement);
    }
  }

  function setMessage() {
    if (map.message) {
      var suffix = map.message;
      if (options.escapeHtml) {
        suffix = escapeHtml(map.message);
      }
      $messageElement.append(suffix).addClass(options.messageClass);
      $toastElement.append($messageElement);
    }
  }

  function setCloseButton() {
    if (options.closeButton) {
      $closeElement.addClass(options.closeClass).attr('role', 'button');
      $toastElement.prepend($closeElement);
    }
  }

  function setProgressBar() {
    if (options.progressBar) {
      $progressElement.addClass(options.progressClass);
      $toastElement.prepend($progressElement);
    }
  }

  function setRTL() {
    if (options.rtl) {
      $toastElement.addClass('rtl');
    }
  }

  function shouldExit(options, map) {
    if (options.preventDuplicates) {
      if (map.message === previousToast) {
        return true;
      } else {
        previousToast = map.message;
      }
    }
    return false;
  }

  function hideToast(override) {
    var method = override && options.closeMethod !== false ? options.closeMethod : options.hideMethod;
    var duration = override && options.closeDuration !== false ?
      options.closeDuration : options.hideDuration;
    var easing = override && options.closeEasing !== false ? options.closeEasing : options.hideEasing;
    if ($(':focus', $toastElement).length && !override) {
      return;
    }
    clearTimeout(progressBar.intervalId);
    return $toastElement[method]({
      duration: duration,
      easing: easing,
      complete: function () {
        removeToast($toastElement);
        clearTimeout(intervalId);
        if (options.onHidden && response.state !== 'hidden') {
          options.onHidden();
        }
        response.state = 'hidden';
        response.endTime = new Date();
        publish(response);
      }
    });
  }

  function delayedHideToast() {
    if (options.timeOut > 0 || options.extendedTimeOut > 0) {
      intervalId = setTimeout(hideToast, options.extendedTimeOut);
      progressBar.maxHideTime = parseFloat(options.extendedTimeOut);
      progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
    }
  }

  function stickAround() {
    clearTimeout(intervalId);
    progressBar.hideEta = 0;
    $toastElement.stop(true, true);
    /*
    $toastElement.stop(true, true)[options.showMethod]({
      duration: options.showDuration,
      easing: options.showEasing
    });
    */
  }

  function updateProgress() {
    var percentage = ((progressBar.hideEta - (new Date().getTime())) / progressBar.maxHideTime) * 100;
    $progressElement.width(percentage + '%');
  }
}

export function install(_Vue) {
  if (Vue && _Vue === Vue) {
    return
  }
  Vue = _Vue
  applyToastr(Vue)
}