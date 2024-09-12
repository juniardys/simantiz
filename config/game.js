var game = {
    maxuser: 2, // Max User to play
    initial_capital: 225000, // Initial Capital
    exec_time: 15, // Time for execution
    bid_time: 30,
    game_time: 3600, // 1800
    automatic_cost: 2000,
    bid_initiator_point: 50,
    bid_cost: 200,
    personal_administration_cost: 20000,
    warehouse: {
        max:1,
        capacity:40,
        cost:15000,
        // age:10,
        depreciation:1500,
    },
    handlingeqp: {
        max: 4,
        cost:2000,
        // age:5,
        capacity:15,
        depreciation:1000,
    },
    rawmaterial: {
        cost:25,
        storage_fee:15,
    },
    factory: {
        // capacity:120,
        max: 1,
        cost:20000,
        age:10,
        depreciation:2000,
    },
    machinebig: {
        cost:10000,
        age:3,
        resaleval:0.5,
        max_lot:15,
        depreciation: 2000,
    },
    machinesmall: {
        cost:7000,
        age:2,
        resaleval:0.5,
        max_lot:10,
        depreciation: 1400,
    },
    production: {
        cost:50,
    },
    worker: {
        cost:500,
        max_lot:5,
        phk:3,
    },
    agent: {
        cost:2000,
        capacity:15,
        phk:3,
    },
    salesman: {
        cost:500,
        commission:0.01,
        capacity:5,
        phk:3,
    },
    clororo: {
        cost: 75,
        option: {
            1: { price: 60, point: 384 },
            2: { price: 70, point: 359 },
            3: { price: 80, point: 335 },
            4: { price: 90, point: 312 },
            5: { price: 100, point: 290 },
            6: { price: 110, point: 269 },
            7: { price: 120, point: 249 },
            8: { price: 130, point: 230 },
            9: { price: 140, point: 212 },
            10: { price: 150, point: 195 },
            11: { price: 160, point: 179 },
            12: { price: 170, point: 164 },
            13: { price: 180, point: 150 },
            14: { price: 190, point: 137 },
            15: { price: 200, point: 125 },
            16: { price: 210, point: 114 },
            17: { price: 220, point: 104 },
            18: { price: 230, point: 95 },
            19: { price: 240, point: 87 },
            20: { price: 250, point: 80 },
            21: { price: 260, point: 74 },
            22: { price: 270, point: 69 },
            23: { price: 280, point: 65 },
            24: { price: 290, point: 62 },
            25: { price: 300, point: 60 },
        }
    },
    prd: {
        name: "Product RnD",
        option: {
            1: {
                cost: 4400,
                point: 15,
            },
            2: {
                cost: 5500,
                point: 36,
            },
            3: {
                cost: 6800,
                point: 59,
            },
            4: {
                cost: 8000,
                point: 82,
            },
            5: {
                cost: 8500,
                point: 93,
            },
            6: {
                cost: 10000,
                point: 115,
            },
            7: {
                cost: 11000,
                point: 131,
            },
            8: {
                cost: 11600,
                point: 150,
            },
            9: {
                cost: 12000,
                point: 156,
            },
            10: {
                cost: 13000,
                point: 165,
            }
        },
    },
    sip: {
        name: "System Improvement",
        option: {
            1: {
                cost: 2300,
                point: 14,
            },
            2: {
                cost: 3000,
                point: 20,
            },
            3: {
                cost: 4700,
                point: 39,
            },
            4: {
                cost: 5200,
                point: 49,
            },
            5: {
                cost: 6500,
                point: 58,
            },
            6: {
                cost: 7500,
                point: 69,
            },
            7: {
                cost: 8300,
                point: 78,
            },
            8: {
                cost: 9700,
                point: 92,
            },
            9: {
                cost: 10600,
                point: 101,
            },
            10: {
                cost: 12500,
                point: 124,
            }
        },
    },
    qap: {
        name: "Quality Assurance",
        option: {
            1: {
                cost: 4400,
                point: 20,
            },
            2: {
                cost: 5500,
                point: 29,
            },
            3: {
                cost: 6800,
                point: 40,
            },
            4: {
                cost: 8000,
                point: 50,
            },
            5: {
                cost: 8500,
                point: 59,
            },
            6: {
                cost: 10000,
                point: 61,
            },
            7: {
                cost: 11000,
                point: 70,
            },
            8: {
                cost: 11600,
                point: 86,
            },
            9: {
                cost: 12000,
                point: 91,
            },
            10: {
                cost: 13000,
                point: 105,
            }
        },
    },
    edp: {
        name: "Employee Development",
        option: {
            1: {
                cost: 2000,
                point: 10,
            },
            2: {
                cost: 3200,
                point: 24,
            },
            3: {
                cost: 4500,
                point: 36,
            },
            4: {
                cost: 5400,
                point: 46,
            },
            5: {
                cost: 6200,
                point: 56,
            },
            6: {
                cost: 7000,
                point: 62,
            },
            7: {
                cost: 8300,
                point: 78,
            },
            8: {
                cost: 9800,
                point: 93,
            },
            9: {
                cost: 10300,
                point: 98,
            },
            10: {
                cost: 14000,
                point: 140,
            }
        },
    },
    mrp: {
        name: "Market Research",
        option: {
            1: {
                cost: 2800,
                point: 8,
            },
            2: {
                cost: 3900,
                point: 23,
            },
            3: {
                cost: 4300,
                point: 30,
            },
            4: {
                cost: 5000,
                point: 39,
            },
            5: {
                cost: 6400,
                point: 56,
            },
            6: {
                cost: 7800,
                point: 78,
            },
            7: {
                cost: 8500,
                point: 91,
            },
            8: {
                cost: 9300,
                point: 100,
            },
            9: {
                cost: 10000,
                point: 108,
            },
            10: {
                cost: 10500,
                point: 120,
            }
        },
    },
    pp: {
        name: "Promotion Program",
        option: {
            1: {
                cost: 2100,
                point: 15,
            },
            2: {
                cost: 3000,
                point: 21,
            },
            3: {
                cost: 4100,
                point: 30,
            },
            4: {
                cost: 5200,
                point: 40,
            },
            5: {
                cost: 6000,
                point: 47,
            },
            6: {
                cost: 7000,
                point: 60,
            },
            7: {
                cost: 8500,
                point: 91,
            },
            8: {
                cost: 10300,
                point: 111,
            },
            9: {
                cost: 12000,
                point: 124,
            },
            10: {
                cost: 13900,
                point: 134,
            }
        },
    },
    ssp: {
        name: "Sales Service",
        option: {
            1: {
                cost: 2500,
                point: 8,
            },
            2: {
                cost: 3100,
                point: 18,
            },
            3: {
                cost: 4400,
                point: 35,
            },
            4: {
                cost: 5500,
                point: 47,
            },
            5: {
                cost: 6300,
                point: 54,
            },
            6: {
                cost: 7200,
                point: 61,
            },
            7: {
                cost: 8000,
                point: 69,
            },
            8: {
                cost: 9000,
                point: 75,
            },
            9: {
                cost: 10100,
                point: 81,
            },
            10: {
                cost: 12500,
                point: 94,
            }
        },
    },
};

module.exports = game;