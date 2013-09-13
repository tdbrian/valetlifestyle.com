
$("#loginForm").on('submit', function(e) {

  // Form being submitted
  var loginData = e.currentTarget;
  console.log($(loginData).serialize());

  // Issue an ajax request
  $.ajax({
    url: '/validateLogin',          
    type: 'PUT',               
    data: $(loginData).serialize(),
    success: function(body, status) {
      if (status == 'success') {
        body = $.parseJSON(body);
        console.log(body);
        if (body.status == 'failed') {
          console.log('failed..')
          $('.loginFailed').show();
        }
        else if (body.hasToken == true) {
          window.location.replace("/dashboard");
        }
        else {
          window.location.replace("/auth");
        }
      }
      else {
        console.log('failed login');
      }
    },
    error: function() {

    }
  });

  // Prevent the browser from submitting the form
  e.preventDefault();

});