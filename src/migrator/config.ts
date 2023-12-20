import { supportedPropDecorators as vuexDecorators } from './vuex';
import { supportedDecorators as vueClassPropertyDecorators } from './vue-property-decorator';

export const vueSpecialMethods = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeUnmount',
  'unmounted',
  'errorCaptured',
  'renderTracked',
  'renderTriggered',
  'activated',
  'deactivated',
  'serverPrefetch',
  'destroyed',
]; // Vue methods that won't be included under methods: {...}, they go to the root.

export const setupSpecialMethods: {
  [key: string]: string |undefined
} = {
  beforeCreate: undefined, // Not supported in setup() hook.
  created: undefined, // Not supported in setup() hook.
  beforeMount: 'onBeforeMount',
  mounted: 'onMounted',
  beforeUpdate: 'onBeforeUpdate',
  updated: 'onUpdated',
  beforeUnmount: 'onBeforeUnmount',
  unmounted: 'onUnmounted',
  errorCaptured: 'onErrorCaptured',
  renderTracked: 'onRenderTracked',
  renderTriggered: 'onRenderTriggered',
  activated: 'onActivated',
  deactivated: 'onDeactivated',
  serverPrefetch: 'onServerPrefetch',
  destroyed: undefined, // Not supported anymore.
}

export const supportedDecorators = [
  ...vuexDecorators,
  ...vueClassPropertyDecorators,
]; // Class Property decorators
