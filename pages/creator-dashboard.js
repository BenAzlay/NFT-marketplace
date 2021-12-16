import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
    nftaddress, marketaddress
} from '../config.js'

import NFT from '../build/contracts/NFT.json'
import Market from '../build/contracts/Market.json'

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([])
    const [sold, setSold] = useState([])

    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNfts()
    }, [])

    
  async function loadNfts() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(marketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId,
          sellet: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description
        }
        return item
      }))

      const soldItems = items.filter(i => i.sold)

      setSold(soldItems)
      setNfts(items)
      setLoadingState('loaded')
  }

  if (loadingState === 'loaded' && !nfts.length) {
    return (<h1 className="px-20 py-10 text-3xl">No assets created</h1>)
  }
  return (
    <div>
      <div className='p-4'>
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {
          nfts.map((nft, i) => {
            return (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{height: '64px'}} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{height: '70px', overflow: 'hidden'}}>
                    <p className='text-gray-400'>{nft.description}</p>
                  </div>
                </div>

                <div className='p-4 bg-black'>
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                </div>
              </div>
            )
          })
        }
        </div>
      </div>

      <div className='px-4'>
        {
            Boolean(sold.length) && (
                <div>
                    <h2 className="text-2xl py-2">Items Created</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                    sold.map((nft, i) => {
                        return (
                        <div key={i} className="border shadow rounded-xl overflow-hidden">
                            <img src={nft.image} />
                            <div className="p-4">
                            <p style={{height: '64px'}} className="text-2xl font-semibold">{nft.name}</p>
                            <div style={{height: '70px', overflow: 'hidden'}}>
                                <p className='text-gray-400'>{nft.description}</p>
                            </div>
                            </div>

                            <div className='p-4 bg-black'>
                            <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                            </div>
                        </div>
                        )
                    })
                    }
                    </div>
                </div>
            )
        }
      </div>
    </div>
  )

}