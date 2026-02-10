import React from 'react';
import { useVotingSystem } from '../hooks/useVotingSystem';

export default function Login() {
    const { account, connected, loading, error, connectWallet } = useVotingSystem();

    return (
        <div className="bg-white rounded-lg shadow p-4 max-w-sm">
            <h4 className="font-semibold mb-4 text-gray-800">Admin Login</h4>

            {connected ? (
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">Connected as</p>
                    <p className="font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200">{account}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Connect your wallet to manage elections</p>
                    <button
                        onClick={connectWallet}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                    >
                        {loading ? 'Connecting...' : 'Connect MetaMask'}
                    </button>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            )}
        </div>
    );
}

