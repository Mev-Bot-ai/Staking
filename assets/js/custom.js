const MetaMaskInstalled = typeof window.ethereum !== "undefined";

if(MetaMaskInstalled){

  window.ethereum.on('chainChanged', async (chainId) => {

    document.location.reload()
  })
  if(window.ethereum) {
      window.ethereum.on('accountsChanged', function () {
          
          document.location.reload()
          
      });
  }

}