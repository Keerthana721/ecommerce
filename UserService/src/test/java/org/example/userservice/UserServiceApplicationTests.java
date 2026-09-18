package org.example.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;

@SpringBootTest
class UserServiceApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
		public  void main1() {

			int[] arr1 = {1, 2, 3};
			int[] arr2 = {4, 5, 6};

			int[] result = new int[arr1.length + arr2.length];

			System.arraycopy(arr1, 0, result, 0, arr1.length);
			System.arraycopy(arr2, 0, result, arr1.length, arr2.length);

			System.out.println(Arrays.toString(result));
		}
	}


