import Vue from 'vue';
import App from './App.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import ECharts from 'vue-echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.component('v-chart', ECharts);

new Vue({
  render: h => h(App),
}).$mount('#app');
