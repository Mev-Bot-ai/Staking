const addZero = (x) => (x < 10 && x >= 0) ? "0" + x : x;

/* STAKING */
var currentAddr;
var networkID = 0;
var tokenContract = null;
var stakeContract = null;
var web3 = null;
var web3Temp = null;

var your_balance = 0;
var your_reward_bnb = 0;
var your_staking = 0;
var totalStaked;
var taxFee = 0;
var earlyFee = 0;
var rewardPerBlock;
//var duration = 0;

var priceCU = 0.0;

var mobileMenu = false;
var desktopMenu = false;
var isFullScreen = false;

window.addEventListener('load', () => {



    $("#myRange").slider({
        min: 7,
        max: 42,
        value: 7,
        ticks: [7, 14, 21, 28, 35],
        ticks_positions: [0, 25, 50, 75, 100],
        ticks_labels: ['7', '14', '21', '28', '35'],
        ticks_snap_bounds: 7
    });

    //Reset
    currentAddr = '';
    tokenContract = null;
    stakeContract = null;
    web3 = null;
    your_balance = 0;
    totalStaked = 0;
    rewardPerBlock = 0;

  //  $.getJSON('https://bsc.api.0x.org/swap/v1/quote?buyToken=' + ADDRESS_CU + '&sellToken=BUSD&sellAmount=100000000000000000', function(data) {
    //    if (data && data.price) {

    //        priceCU = (1 / data.price).toFixed(10);
    //        $("#cashio-price").text(priceCU + " BUSD");
    //        $("#cashio-cap").text(new Intl.NumberFormat().format((priceCU * 777777777).toFixed(2)) + " BUSD");
    //    }
    //});
    $.getJSON('https://api.dexscreener.io/latest/dex/tokens/' + ADDRESS_CU, function(data) {
        if (data && data.price) {

            priceCUT = (1 / data.pairs[0].priceUsd).toFixed(10);
            console.log(priceCUT)
            //priceMoonUsd = data.pairs[0].priceUsd
            //console.log('Moon-Fi Price:' + priceMoonUsd);
            $("#cashio-price").text(priceCU + " BUSD");
            $("#cashio-cap").text(new Intl.NumberFormat().format((priceCU * 777777777).toFixed(2)) + " BUSD");
        }
    });
    var apiUrl = 'https://api.dexscreener.io/latest/dex/tokens/' + ADDRESS_CU ;
    fetch(apiUrl).then(response => {
      return response.json();
    }).then(data => {
      // Work with JSON data here
      priceMoonUsd = data.pairs[0].priceUsd
      console.log('Croki Price:' + priceMoonUsd);
      $("#cashio-price").text(priceMoonUsd + " BUSD");
      $("#cashio-cap").text(new Intl.NumberFormat().format((priceMoonUsd * 777777777).toFixed(2)) + " BUSD");
    }).catch(err => {
      // Do something for an error here
    });
    var apiUrl2 = 'https://api.dexscreener.io/latest/dex/tokens/' + "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    fetch(apiUrl2).then(response => {
      return response.json();
    }).then(data => {
      // Work with JSON data here
      priceBnb = data.pairs[0].priceUsd
      console.log('SGR Price:' + priceBnb);
      //$("#cashio-price").text(priceCro + " BUSD");
      //$("#cashio-cap").text(new Intl.NumberFormat().format((priceCro * 777777777).toFixed(2)) + " BUSD");
    }).catch(err => {
      // Do something for an error here
    });
    mainContractInfo();
    Connect();
})



async function mainContractInfo() {
    if (NETID == 56) {
        web3 = new Web3(RPCSERVERMAIN);
    } else {
        web3 = new Web3(RPCSERVERBACKUP);
    }
    tokenContract = await new web3.eth.Contract(ABI_CU, ADDRESS_CU);
    stakeContract = await new web3.eth.Contract(ABI_STAKE, ADDRESS_STAKE);
    update();
}

async function Connect() {
    if (window.ethereum) {
        web3Temp = new Web3(window.ethereum)
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            let accounts = await window.ethereum.request({ method: 'eth_accounts' })
            currentAddr = accounts[0]
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
            runAPP()
            return
        } catch (error) {
            console.error(error)
        }
    }
}


async function runAPP() {
    networkID = await web3Temp.eth.net.getId()
    if (networkID == NETID) {
        web3 = web3Temp;
        tokenContract = await new web3.eth.Contract(ABI_CU, ADDRESS_CU);
        stakeContract = await new web3.eth.Contract(ABI_STAKE, ADDRESS_STAKE);

        getCurrentWallet();
        update()
    } else {
        $(".btn-connect").text("Wrong network!");
        $(".btn-connect2").text("Wrong network!");

        if (window.ethereum) {
            const data = [{
                    chainId: '0x38',
                    //chainId: '0x61', //Testnet
                    chainName: 'Binance Smart Chain',
                    nativeCurrency: {
                        name: 'BNB',
                        symbol: 'BNB',
                        decimals: 18
                    },
                    rpcUrls: [RPCSERVERMAIN],
                    blockExplorerUrls: [BLOCKEXPLORER],
                }]
                /* eslint-disable */
            const tx = await window.ethereum.request({ method: 'wallet_addEthereumChain', params: data }).catch()
            if (tx) {
                console.log(tx)
            }
        }
    }
}




$("#btn-connect-metamask").click(() => {
    if (window.ethereum) {
        Connect();
    } else {
        alert("Please install Metamask first");
    }
})

$("#btn-connect-trust").click(() => {
    if (window.ethereum) {
        Connect();
    } else {
        alert("Please install Trust wallet and open the website on Trust/DApps");
    }
})


$("#btn-connect-wlconnect").click(async() => {
    var WalletConnectProvider = window.WalletConnectProvider.default;
    var walletConnectProvider = new WalletConnectProvider({
        rpc: {
            NETID: RPCSERVERMAIN
        },
        chainId: NETID,
        network: NETWORK,
    });
    await walletConnectProvider.enable();

    web3Temp = new Web3(walletConnectProvider);
    var accounts = await web3Temp.eth.getAccounts();
    currentAddr = accounts[0];
    var connectedAddr = currentAddr[0] + currentAddr[1] + currentAddr[2] + currentAddr[3] + currentAddr[4] + currentAddr[5] + '...' + currentAddr[currentAddr.length - 6] + currentAddr[currentAddr.length - 5] + currentAddr[currentAddr.length - 4] + currentAddr[currentAddr.length - 3] + currentAddr[currentAddr.length - 2] + currentAddr[currentAddr.length - 1]
    $(".btn-connect").text(connectedAddr)
    $(".btn-connect2").text(connectedAddr)
    $(".btn-connect").prop("disabled", true);
    $(".btn-connect2").prop("disabled", true);
    $("#btn-unlock-wallet").css("display", "none");
    $("#btn-approve").css("display", "block");

    walletConnectProvider.on("chainChanged", (chainId) => {
        window.location.reload();
    });
    walletConnectProvider.on("disconnect", (code, reason) => {
        console.log(code, reason);
        window.location.reload();
    });

    runAPP()
})

async function getCurrentWallet() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
            currentAddr = accounts[0]
            var connectedAddr = currentAddr[0] + currentAddr[1] + currentAddr[2] + currentAddr[3] + currentAddr[4] + currentAddr[5] + '...' + currentAddr[currentAddr.length - 6] + currentAddr[currentAddr.length - 5] + currentAddr[currentAddr.length - 4] + currentAddr[currentAddr.length - 3] + currentAddr[currentAddr.length - 2] + currentAddr[currentAddr.length - 1]
            $(".btn-connect").text(connectedAddr);
            $(".btn-connect2").text(connectedAddr);
            $(".btn-connect").prop("disabled", true);
            $(".btn-connect2").prop("disabled", true);

            $("#btn-unlock-wallet").css("display", "none");
            $("#btn-approve").css("display", "block");
        }
    }
}

async function updateParameters() {

    if (tokenContract) {
        if (currentAddr != null && currentAddr != undefined && currentAddr != "") {
            tokenContract.methods.balanceOf(currentAddr).call().then(res => {
                your_balance = Math.floor(res) / 1e9;
                //$("#your-balance").text(your_balance);
                $("#your-cu-balance0").text(your_balance);
                $("#your-cu-balance").text(your_balance);

            })

            tokenContract.methods.allowance(currentAddr, ADDRESS_STAKE).call().then(res => {
                if ((res / 1e18) < 100000000) {
                    $("#btn-approve").css("display", "block");
                    $("#btn-stake").css("display", "none");
                } else {
                    $("#btn-approve").css("display", "none");
                    $("#btn-stake").css("display", "block");
                }
            })
        }
    }


    if (stakeContract) {

        //var res = await stakeContract.methods.farmEnabled().call();
        //if (res == false)
            //return;

            stakeContract.methods.rewardPerBlock().call().then(res => {
                var rewardPerBlock = res;
                console.log("rew per block " + rewardPerBlock);
                var rewardPerYear = (((res / 1e18) * 28800) * 365);
                console.log("BNB per Year " + rewardPerYear);
                rewardPerYearUsd = rewardPerYear * priceBnb;
                console.log("USD per Year " + rewardPerYearUsd);

                $("#info-total-distributed-usdt").text(rewardPerYear);
            })

            stakeContract.methods.rewardPerBlock().call().then(res => {
                var rewardPerYear1 = (((res / 1e18) * 28800) * 365).toFixed(6);
                console.log("APY Calc " + apyCalc);

                $("#info-total-distributed-usdt1").text(rewardPerYear1);
            })

            stakeContract.methods.totalStaked().call().then(res => {
                totalStaked = (res / 1e9).toFixed(2);
                $("#info-total-staking").text(totalStaked).toLocaleString('en');
                $("#info-total-staking-usd").text("$" + (totalStaked * priceMoonUsd).toFixed(2));
                apyCalc = (1000 / priceMoonUsd);
                console.log("Rewards Token USD single " + priceMoonUsd);

                var poolValueUsd = totalStaked * priceMoonUsd;
                console.log("Pool Value USD " + poolValueUsd);

                var apyNew = (rewardPerYearUsd / poolValueUsd)
                var apyNewtoPerc = (apyNew * 100);
                console.log("APY% " + apyNewtoPerc);

                if (rewardPerBlock >= 0 && totalStaked > 0) {
                   $("#info-apy").text((apyNewtoPerc).toFixed(2) + "%");
                }

                percentStaked = totalStaked / 1000000000000000;
                console.log("Percent Staked " + (percentStaked));

            if (totalStaked > 0) {
                var your_share = ((your_staking / totalStaked) * 100).toFixed(2);
                $("#your-share").text(your_share + "%")
            }
        })

        //stakeContract.methods.accRewardPerShare().call().then(res => {
        //    var totalUSDTDistributed = (res / 1e18).toFixed(6);

        //    $("#info-total-distributed-usdt").text(totalUSDTDistributed);
        //})

        //stakeContract.methods.totalFee().call().then(res => {
        //    taxFee = res+'%';
        //    $(".entry-fee-value").text(taxFee);
        //})

        //stakeContract.methods.earlyWithdrawFee().call().then(res => {
        //    earlyFee = res+'%';
        //    $(".early-fee-value").text(earlyFee);
        //})

        stakeContract.methods.totalBNBClaimedRewards().call().then(res => {
            var totalTokenDistributed = (res / 1e18).toFixed(2);
            $("#total-bnb-claimed").text(totalTokenDistributed);
        })





        if (currentAddr != null && currentAddr != undefined && currentAddr != "") {

            stakeContract.methods.pendingReward(currentAddr).call().then(res => {

                $("#your-cu-reward").text((res / 1e18).toFixed(6));
                //$("#your-usdt-reward").text((res[1] / 1e18).toFixed(4));

            });
            stakeContract.methods.userInfo(currentAddr).call().then(res => {

                //$("#your-cu-reward").text((res / 1e18).toFixed(8));
                $("#your-usdt-reward").text((res[1] / 1e18).toFixed(5));

            });
            stakeContract.methods.viewWalletClaimed(currentAddr).call().then(res => {

                //$("#your-cu-reward").text((res / 1e18).toFixed(8));
                $("#your-bnb-claimed").text((res / 1e18).toFixed(6));

            });
            stakeContract.methods.userInfo(currentAddr).call().then(res => {

                your_staking = Math.floor(res[0]) / 1e9;
                if (totalStaked > 0) {
                    var your_share = ((your_staking / totalStaked) * 100).toFixed(2);
                    $("#your-share").text(your_share + "%")
                }

                $("#your-staking").text(your_staking);
                $("#your-staking1").text(your_staking);
                $("#your-staking2").text(your_staking);
                $("#your-staking-usd").text("$" + (priceMoonUsd * your_staking).toFixed(2));
                if (your_staking > 0) {

                    var unlockDate = (parseInt(res.lastTimeDeposit) + parseInt(res.lockingTime)) * 1000;
                    var current = new Date().getTime();

                    $("#your-unlock-date").text(new Date(unlockDate).toLocaleString('en-US'));

                    if (unlockDate > current) {
                        $("#your-locked").text(your_staking.toFixed(2));
                        $("#your-unlocked").text('0');

                        const distance = unlockDate - current;
                        // Time calculations for days, hours, minutes and seconds
                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                        $("#your-time-left").text(days + " days, " + addZero(hours) + ":" + addZero(minutes) + ":" + addZero(seconds));
                    } else {
                        $("#your-unlocked").text(your_staking.toFixed(2));
                        $("#your-locked").text('0');

                        $("#your-time-left").text('0 days, 0:0:0');
                    }
                } else {
                    $("#your-locked").text('0');
                    $("#your-unlocked").text('0');
                    $("#your-time-left").text('0 days, 0:0:0');
                    $("#your-unlock-date").text('--, -- , --:--');
                }
            })
        }
    }
}

function update() {
    console.log("Update");
    updateParameters();
}
setInterval(update, 10000)


$("#btn-stake-max").click(() => {
    $("#input-stake").val(your_balance);
    //updateLockBonus();
})

$("#btn-unstake-max").click(() => {
    $("#input-unstake").val(your_staking);
})

$("#btn-withdraw-bnb-max").click(() => {
    $("#input-reward-bnb").val(your_reward_bnb);
})

$("#btn-approve").click(() => {
    try {
        if (tokenContract && currentAddr != null && currentAddr != undefined) {
            tokenContract.methods.approve(ADDRESS_STAKE, "1000000000000000000000000000000000000000000000").send({
                value: 0,
                from: currentAddr,
            })
        }
    } catch (error) {}
})


$("#btn-stake").click(() => {
    //updateDuration();
    try {
        if (stakeContract && currentAddr != null && currentAddr != undefined) {
            //var BN = web3.utils.BN;
            var amountstake = $("#input-stake").val();
            var stake1 = (amountstake * 1000000000);
            var stake2 = web3.utils.toBN(stake1);//.toString();
            console.log("Amount: " + $(stake2));

            //var timeperiod = $("#myRange").val(); //* 24 * 60 * 60;
            //console.log("Lock time: " + $("#myRange").val());

              stakeContract.methods.deposit(stake2).send({
                  //value: 0,
                  from: currentAddr,
              })

        }
    } catch (error) {console.log(error)}
})

$("#withdraw-rewards").click(() => {
    try {
        if (stakeContract && currentAddr != null && currentAddr != undefined) {

            stakeContract.methods.claimRewards().send({
                value: 0,
                from: currentAddr,
            })
        }
    } catch (error) {}
})

$("#btn-unstake").click(() => {
    try {
        if (stakeContract && currentAddr != null && currentAddr != undefined) {
            var amount = $("#input-unstake").val();
            var tokens1 = (amount * 1e9);
            var tokens2 = web3.utils.toBN(tokens1);
            console.log(tokens2)
            //let tokens = (tokens1);
            stakeContract.methods.emergencyWithdraw().send({
                value: 0,
                from: currentAddr,
            })
        }
    } catch (error) {console.log(error)}
})


$('#input-stake').on('input', () => {
    updateLockBonus();
});

$('#myRange').on('change', () => {
    updateLockBonus();

});


function updateLockBonus() {
    var days = 0;
    $("#info-lock-time").text(days);

    var bonusPercentTime100 = days * baseLockBonus / 15;
    $('#info-lock-bonus-percent').text((bonusPercentTime100 / 100).toFixed(2))

    var bonusLock = (days * bonusPercentTime100 * parseFloat($("#input-stake").val()) / 10000).toFixed(2);
    if (bonusLock == NaN || bonusLock == 'NaN')
        $('#info-lock-bonus').text("0");
    else
        $('#info-lock-bonus').text(bonusLock);
}
