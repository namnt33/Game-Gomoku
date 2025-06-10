package com.btec.gomoku_game;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class 	GomokuGameApplication {

	public static void main(String[] args) {
		SpringApplication.run(GomokuGameApplication.class, args);
	}

}
