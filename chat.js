<?php
include "/home/thegtorg/public_html/include/session.php";
header("Content-type: text/javascript");
if (!isset($_SESSION["gtid"])) {
  die("var gtchat = {};");
}
?>
var gtchat = {
  // Settings and Configuration
  username: "<?=htmlentities($_SESSION["username"]); ?>",
  
  // GUI
  gui: {
    container: null,
    log: null,
    input: null,

    init : function () {
      gtchat.gui.container = document.createElement("div");
      gtchat.gui.container.className = "gtchat";
      gtchat.gui.log = document.createElement("div");
      gtchat.gui.log.className = "gtchat_log";
      gtchat.gui.input = document.createElement("input");
      gtchat.gui.input.type = "text";
      gtchat.gui.input.className = "gtchat_input";
      gtchat.gui.input.onkeypress = gtchat.gui.keyPressed;
      gtchat.gui.container.appendChild(gtchat.gui.log);
      gtchat.gui.container.appendChild(gtchat.gui.input);
      return gtchat.gui.container;
    },
    
    format : function (message, nick) {
      if (nick) {
        return '<div class="message"><span class="nick">&lt;' + nick + '&gt;</span>&nbsp;' + message + '</div>';
      } else {
        return '<div class="message">' + message + '</div>';
      }
    },
    
    add : function (message, nick) {
      gtchat.gui.log.innerHTML = gtchat.gui.log.innerHTML + "\n" + gtchat.gui.format(message, nick);
    },

    keyPressed : function (e) {
      if (!e) {
        e = window.event;
      }
      if (e.keyCode == 13 && e.srcElement == gtchat.gui.input) {
        gtchat.socket.send(gtchat.socket.prepare(gtchat.gui.input.value));
        gtchat.gui.input.value = '';
      }
    },
  },

  // Sockets & Networking
  sock: null,
  socket: {
    server: "hydrogen.thegt.org",
    port: 2505,
    start: function () {
      gtchat.sock = new WebSocket("ws://"+gtchat.socket.server+":"+gtchat.socket.port+"/chat");
      gtchat.sock.onopen = gtchat.socket.opened;
      gtchat.sock.onclose = gtchat.socket.closed;
      gtchat.sock.onerror = gtchat.socket.error;
      gtchat.sock.onmessage = gtchat.socket.message;
    },
    prepare : function (message) {
      return JSON.stringify({
        nick: gtchat.username,
        msg: message,
        special: false,
      });
    },
    send : function (message) {
      gtchat.sock.send(message);
    },
    opened : function () {
      gtchat.socket.send(gtchat.username);
    },
    closed : function () {
      gtchat.gui.add("Disconnected by the server.");
    },
    error : function (e) {
      console.error(e);
    },
    message : function (e) {
      var data = JSON.parse(e.data);
      if (data.special) {
        gtchat.gui.add(data.msg);
      } else {
        gtchat.gui.add(data.msg, data.nick);
      }
    },
  },

  // Start the chat!
  start : function () {
    document.getElementsByTagName("body")[0].appendChild(gtchat.gui.init());
    gtchat.socket.start();
  },
};