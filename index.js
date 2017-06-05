const HOST = "https://4linebc.isobar.com.tw/democampaign/";
const SOCKET_SERVER = "";

$(function () {
  (function () {
    function _log() { }
    var _io = io;
    var _socket = null;

    var _defLoad = $.Deferred();
    _defLoad.resolve();
    var _defConnect = $.Deferred();

    $.socketio = function (ASettings) {
      $.extend($.socketio.settings, ASettings);
      return $.socketio;
    };

    $.socketio.connect = function (AConnect, ADisconnect) {
      _defLoad.done(function () {
        try {
          _socket = _io($.socketio.settings.ioServer + '/' + $.socketio.settings.ioServerNS);

          _socket.on('connect', function () {
            _log('socket.io', 'connect', $.socketio.getID());

            if (AConnect) AConnect();
          });

          _socket.on('disconnect', function () {
            _log('socket.io', 'disconnect');

            if (ADisconnect) ADisconnect();
          });

          _defConnect.resolve();
        } catch (ex) {
          _log('socket.io', 'connect_error', ex);
        }
      });
      return $.socketio;
    };

    $.socketio.getID = function () {
      return (_socket) ? _socket.io.engine.id : null;
    };

    $.socketio.bind = function (AMsgAFunMapObj) {
      _defConnect.done(function () {
        $.each(AMsgAFunMapObj, function (k, v) {
          _socket.on(k, v);
        });
      });
      return $.socketio;
    };

    $.socketio.sendTo = function (AToID, AMsg, AData) {
      _log('socket.io', 'send', AToID, AMsg, AData);

      _socket.emit('sendTo', { ns: $.socketio.settings.ioServerNS, msg: AMsg, to: AToID, data: AData });
      return $.socketio;
    };

    $.socketio.settings = {
      ioServer: 'http://4ioserver.isobar.com.tw:80'
      , ioServerNS: 'democampaign'
    };

  })();

  var Token = (function () {
    var CHARS = '01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var LENGTH = 8;
    function R(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    return {
      _keep: 30 * 60 * 1000,
      list: [],
      clean: function () {
        var now = new Date();
        this.list = $.grep(this.list, function (o) { return o.expire > now; });
      },
      valid: function (value) {
        this.clean();
        var match = $.grep(this.list, function (o) { return o.value == value }).length;
        if (match) {
          // reset all
          this.list = [];
          this.generate();
        }
        return match;
      },
      generate: function () {
        var tmp = [];
        var now = new Date();
        var len = LENGTH;
        while (len-- > 0) { tmp.push(R(CHARS)); }
        var token = {
          value: tmp.join(''),
          expire: new Date(now.getTime() + this._keep)
        };
        console.log('generate', token);
        this.list.push(token);
        this.clean();
        $(document).trigger('token.generate', token);
        return token;
      }
    };
  })();


  $(document).on('token.generate', function (e, token) {
    var url = HOST + 'mobile/check-in.aspx?t=' + token.value + '&s=' + encodeURIComponent($.socketio.getID());
    $('#qr-code').attr('src', 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent(url));
  });


  // 載入js
  $.socketio()
  .bind({
    'success': function (data) {
      console.log('success...?', data);
      if (!Token.valid(data.token)) { return; }
      console.log('success !!!', data);
      // alert('Hi, ' + data.name);
      send(data.mid+" "+data.name);
    }
  })
  .connect(
    function () {
      $('#connecting').fadeOut();
      $('#wrap').empty().append(
        $('<img id="qr-code" />').hide().load(function () { $(this).fadeIn(); })
      );
      setInterval(function () {
        Token.generate();
      }, 3 * 60 * 1000);
      Token.generate();
    }
    , function () {
      console.log('disconnect');
      setTimeout(function () {
        if (prompt('disconnected. need to reload page.')) {
          location.reload();
        }
      },2000);
    }
  );
});

var net = require('net');
var client = new net.Socket();
function send(name) {
  client.connect(5555, 'localhost', function() {
    console.log('send:'+name);
    client.write('name:'+name+"\n");
    client.destroy();
  });
}
