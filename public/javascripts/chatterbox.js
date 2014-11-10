var socket = io();
$(document).ready(function(){

    var colorDef = '#000000';

    $(".basic").spectrum({
        color: colorDef,
        change: function(color) {
            colorDef = color.toHexString() ;
        }
    });

    socket.on('connect', function (data) {
        socket.emit('join', null, function( ) {
            $.getJSON( '/messages', function( messages ) {
                messages.forEach (function (msgPair) {
              $('#messages').append(
                  $('<li>').text(msgPair.name + ": " +msgPair.message).css('color', msgPair.color ).append($('<span class="timer">').text(msgPair.timestamp))
              ); 
                });
            });               
        }); 
    });

    $('form').submit(function(event){
         event.preventDefault();
         var name =  $('#namemdlg').val().length > 0 ? $('#namemdlg').val() : $('#namexssm').val();
         name = name.length > 0 ? name : "Anyonomus";  
         var currentdate = new Date(); 
         var hours = currentdate.getHours() > 10 ? currentdate.getHours() : '0' + currentdate.getHours();
         var min =  currentdate.getMinutes() > 10  ? currentdate.getMinutes() : '0' + currentdate.getMinutes(); 
         var sec = currentdate.getSeconds() > 10 ? currentdate.getSeconds() : '0' + currentdate.getSeconds(); 
         var month = (currentdate.getMonth() + 1) > 10  ? currentdate.getMonth()+1 : '0' + (currentdate.getMonth()+1); 
         var dt = currentdate.getDate() > 10  ? currentdate.getDate() : '0' + currentdate.getDate(); 
         var timestamp = hours + ":" + min + ":" + sec + " " + month + "/" + dt  + "/" + currentdate.getFullYear();
         var msgPair = { 
                name : name, 
                message: $('#msg').val(),
                color : colorDef,
                timestamp : timestamp
         };  
         socket.emit('chat', msgPair, function ( ) {
             $.ajax({
                 type: 'POST',
                 data: msgPair,
                 url: '/addmessage',
                 dataType: 'JSON'
             });
         });
         $("#messages").animate({ scrollTop: $(document).height() }, "fast");
         $('#msg').val('');
         return false; 
      });   
      socket.on ('chat', function(msgPair) {
          $('#messages').append($('<li>').text(msgPair.name + ": " + msgPair.message).css('color', msgPair.color).append($('<span class="timer">').text(msgPair.timestamp))
                               );
      });  
});