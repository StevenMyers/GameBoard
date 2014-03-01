package com.staxle.gameboard;

import java.net.URISyntaxException;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import android.os.Bundle;
import android.app.Activity;
import android.util.Log;
import android.view.Menu;

public class MainActivity extends Activity {
	private static final String TAG = "StartupActivity";

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		Log.v(TAG, "Starting Socket.io");
		try {
			final Socket socket = IO.socket("http://localhost:3000");
			Log.v(TAG, "Socket Started!");
			socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {

				@Override
				public void call(Object... args) {
					Log.v(TAG, "Socket.io: (Connect)");
					socket.emit("foo", "hi");
					socket.disconnect();
				}

			}).on("event", new Emitter.Listener() {
				@Override
				public void call(Object... args) {
					Log.v(TAG, "Socket.io: (Event)");
				}

			}).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {

				@Override
				public void call(Object... args) {
					Log.v(TAG, "Socket.io: (Disconnect)");
				}

			});
			Log.v(TAG, "Connecting to Socket");
			socket.connect();
			Log.v(TAG, "Connected to Socket");
		} catch (URISyntaxException e) {
			System.out.println("Bad url provided");
			e.printStackTrace();
		}
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}

}
