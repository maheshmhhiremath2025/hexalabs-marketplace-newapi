'use client';

import { useState } from 'react';
import { Terminal, BookOpen, SkipBack, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function LabPage({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState<'instructions' | 'resources'>('instructions');

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-slate-900 text-white font-sans">

            {/* Left Pane: Instructions */}
            <div className="w-full md:w-1/3 border-r border-slate-700 flex flex-col bg-slate-800">
                <div className="h-12 border-b border-slate-700 flex items-center px-4 gap-4 bg-slate-900">
                    <button
                        onClick={() => setActiveTab('instructions')}
                        className={`text-sm font-medium h-full border-b-2 px-2 flex items-center gap-2 ${activeTab === 'instructions' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        <BookOpen className="h-4 w-4" /> Instructions
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`text-sm font-medium h-full border-b-2 px-2 flex items-center gap-2 ${activeTab === 'resources' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        Resources
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none">
                    <h2>Lab 1: Configure Azure Resources</h2>
                    <p>In this lab, you will learn how to create and configure a Resource Group and a Storage Account.</p>

                    <h3>Scenario</h3>
                    <p>You are an administrator for Contoso Ltd. You need to provision storage for the finance department.</p>

                    <h3>Task 1: Sign in to Azure Portal</h3>
                    <ol>
                        <li>On the right side, note the **Username** and **Password** provided in the Resources tab.</li>
                        <li>Click on the Windows VM display to focus it.</li>
                        <li>Open Edge browser and navigate to <code>portal.azure.com</code>.</li>
                        <li>Sign in with the student credentials.</li>
                    </ol>

                    <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 my-4">
                        <p className="m-0 text-yellow-200 text-xs">Note: It may take a few minutes for resources to provision.</p>
                    </div>

                    <h3>Task 2: Create a Storage Account</h3>
                    <ol>
                        <li>Search for "Storage accounts".</li>
                        <li>Click **Create**.</li>
                        <li>Select "Standard" performance.</li>
                    </ol>
                </div>

                <div className="h-14 border-t border-slate-700 flex items-center justify-between px-4 bg-slate-900">
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Previous">
                            <SkipBack className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-mono self-center">Page 1 of 5</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium">
                        Next
                    </button>
                </div>
            </div>

            {/* Right Pane: Virtual Machine / Terminal */}
            <div className="flex-1 bg-black flex flex-col relative">
                <div className="h-10 bg-slate-800 flex items-center justify-between px-4 border-b border-slate-700">
                    <div className="text-xs font-mono text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        CONNECTED: {params.id.toUpperCase()}-VM
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white">
                            <Terminal className="h-3 w-3" /> Type Text
                        </button>
                        <button className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white">
                            <Save className="h-3 w-3" /> Save
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-1 text-xs bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded border border-red-900">
                            <X className="h-3 w-3" /> End Lab
                        </Link>
                    </div>
                </div>

                {/* Simulated VM Screen */}
                <div className="flex-1 flex items-center justify-center bg-zinc-900 relative group">
                    <div className="text-center">
                        <div className="text-6xl mb-4 opacity-20">🖥️</div>
                        <h3 className="text-xl font-mono text-zinc-500 mb-2">Interactive Lab Environment</h3>
                        <p className="text-zinc-600 max-w-md mx-auto">
                            In a real deployment, this area would stream a Windows/Linux VM or provide a VS Code instance via Guacamole/Websockets.
                        </p>
                        <div className="mt-8 p-4 bg-black border border-zinc-800 rounded font-mono text-left max-w-lg mx-auto text-sm text-green-500 shadow-2xl">
                            <p>$ initializing environment...</p>
                            <p>$ loading resources...</p>
                            <p>$ connecting to {params.id}...</p>
                            <p className="animate-pulse">$ _</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
