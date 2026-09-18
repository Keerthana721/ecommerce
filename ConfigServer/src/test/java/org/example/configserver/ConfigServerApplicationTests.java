package org.example.configserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@SpringBootTest
class ConfigServerApplicationTests {

    @Test
    void contextLoads() {

        String str = "aabbccabc";

        StringBuilder result = new StringBuilder();

        int count = 1;

        for (int i = 1; i <= str.length(); i++) {

            if (i < str.length() && str.charAt(i) == str.charAt(i - 1)) {
                count++;
            } else {
                result.append(str.charAt(i - 1)).append(count);
                count = 1;
            }
        }
//a2b2c2a1b1c1


        String s1 = "keerthana";
        String s2 = "anahtreek";

        boolean isAnagram =
                s1.chars().sorted().boxed().toList()
                        .equals(
                                s2.chars().sorted().boxed().toList()
                        );

        System.out.println(isAnagram);
        System.out.println(result);

//        return map.isEmpty();

    }
}







