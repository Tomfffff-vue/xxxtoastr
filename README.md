# xxxtoastr

Vue.use(Toastr)
let toastr = new Toastr.Toastr({
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toastr-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
})

new Vue({
  el: '#app',
  toastr,
  render: (h) => h(App),
  components: {
  },
});

this.$toastr.info('test');
