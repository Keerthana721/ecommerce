package com.api.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.*;
import java.util.stream.*;

@SpringBootTest
class ApiGateWayApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    public void data() {
        List<Integer> num = Arrays.asList(1, 2, 3, 2, 4, 1, 5);
        List<Integer> res = num.stream().filter(n -> n <= 20).collect(Collectors.toList());
        System.out.println("res = " + res);


        List<Integer> result = num.stream().filter(n -> String.valueOf(n).startsWith("1")).collect(Collectors.toList());
        System.out.println("result = " + result);


//        Input: [5, 12, 18, 7, 30]
//        Output: 3

        Long grater = num.stream().filter(n -> n >= 10).collect(Collectors.counting());
        System.out.println("grater = " + grater);

//        Input: [10, 12, 23, 14, 56, 18]
//        Output: [10, 12, 14, 18]

//        Input: [1,2,3,2,4,1,5]
//        Output: [1,2]

        Set<Integer> set = new LinkedHashSet<>();
        List<Integer> duplicate = num.stream().filter((n -> !set.add(n))).sorted().collect(Collectors.toList());
        System.out.println("duplicate = " + duplicate);

//        Input: [1,2,2,3,4,4,5]
//        Output: [1,2,3,4,5]
        List<Integer> removeDup = num.stream().distinct().sorted(Comparator.reverseOrder()).collect(Collectors.toList());
        System.out.println("duplicate = " + removeDup);
//        Input: ["A","B","C"]
//        Output: "A,B,C"

        int arr[]={1,3,4,5,6,7};
        int current = arr[0];
        int best = arr[0];

        for (int i = 1; i < arr.length; i++) {
            current = Math.max(arr[i], current + arr[i]);
            best = Math.max(best, current);
        }

        System.out.println(best);
    }
}
//    @Test
//    public class StringGroup {
//        public static void main(String[] args) {
//            String input = "Indian army".replaceAll(" ", "");
//
//            StringBuilder upper = new StringBuilder();
//            StringBuilder lower = new StringBuilder();
//
//            for (char ch : input.toCharArray()) {
//                if (Character.isUpperCase(ch)) {
//                    upper.append(ch);
//                } else {
//                    lower.append(ch);
//                }
//            }
//
//            System.out.println(upper.toString() + lower.toString());
//        }
//    }
//}
