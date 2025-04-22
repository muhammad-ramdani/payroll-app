<?php

it('mengembalikan respons berhasil', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
