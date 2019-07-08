function test_matmul_zeros() {
    M = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]]
    v = [1, 2, 3]
    expected = [0, 0, 0]
    result = matmul(M, v)
    print(`This ${result} is ${expected}`)
}

function test_matmul_values() {
    M = [[10, 20, 30],
        [10, 20, 30],
        [10, 20, 30]]
    v = [1, 2, 3]
    expected = [60, 120, 180]
    result = matmul(M, v)
    print(`This ${result} is ${expected}`)
}

function run_tests() {
    test_matmul_zeros()
    test_matmul_values()
}