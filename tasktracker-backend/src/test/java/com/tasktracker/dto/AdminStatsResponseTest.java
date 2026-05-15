package com.tasktracker.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AdminStatsResponseTest {

    @Test
    void builderShouldSetAllFieldsCorrectly() {

        AdminStatsResponse response = AdminStatsResponse.builder()
                .totalUsers(100L)
                .totalTasks(250L)
                .doneTasks(150L)
                .inProgressTasks(50L)
                .build();

        assertThat(response.getTotalUsers()).isEqualTo(100L);
        assertThat(response.getTotalTasks()).isEqualTo(250L);
        assertThat(response.getDoneTasks()).isEqualTo(150L);
        assertThat(response.getInProgressTasks()).isEqualTo(50L);
    }

    @Test
    void settersAndGettersShouldWorkCorrectly() {

        AdminStatsResponse response = AdminStatsResponse.builder().build();

        response.setTotalUsers(10L);
        response.setTotalTasks(20L);
        response.setDoneTasks(15L);
        response.setInProgressTasks(5L);

        assertThat(response.getTotalUsers()).isEqualTo(10L);
        assertThat(response.getTotalTasks()).isEqualTo(20L);
        assertThat(response.getDoneTasks()).isEqualTo(15L);
        assertThat(response.getInProgressTasks()).isEqualTo(5L);
    }

    @Test
    void equalsHashCodeAndToStringShouldWork() {

        AdminStatsResponse response1 = AdminStatsResponse.builder()
                .totalUsers(1L)
                .totalTasks(2L)
                .doneTasks(3L)
                .inProgressTasks(4L)
                .build();

        AdminStatsResponse response2 = AdminStatsResponse.builder()
                .totalUsers(1L)
                .totalTasks(2L)
                .doneTasks(3L)
                .inProgressTasks(4L)
                .build();

        assertThat(response1)
                .isEqualTo(response2)
                .hasSameHashCodeAs(response2);

        assertThat(response1.toString())
                .contains("totalUsers=1")
                .contains("totalTasks=2")
                .contains("doneTasks=3")
                .contains("inProgressTasks=4");
    }
}