"use client";

import { useState, useEffect, useRef } from 'react';

const BOOT_SEQUENCE = [
    "Establishing secure connection...",
    "Verifying identity...",
    "Access granted.",
    "Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.15.0-1049-azure x86_64)",
    "",
    " * Documentation:  https://help.ubuntu.com",
    " * Management:     https://landscape.canonical.com",
    " * Support:        https://ubuntu.com/advantage",
    "",
    "  System information as of " + new Date().toUTCString(),
    "",
    "  System load:  0.08              Processes:             109",
    "  Usage of /:   18.4% of 28.90GB  Users logged in:       1",
    "  Memory usage: 14%               IPv4 address for eth0: 10.0.0.4",
    "  Swap usage:   0%",
    "",
    "0 updates can be applied immediately.",
    "",
    "Type 'help' for a list of available commands.",
    ""
];

const COMMANDS: Record<string, Function | string> = {
    'help': 'Available commands: help, ls, pwd, whoami, clear, exit, date, mkdir, df, sudo, cat, uname',
    'ls': 'Documents  Downloads  lab-instructions.txt  workspace  setup.sh',
    'pwd': '/home/azureuser',
    'whoami': 'azureuser',
    'date': () => new Date().toString(),
    'exit': 'Closing connection...',
    'sudo': (args: string) => {
        if (args.startsWith('apt')) return 'Reading package lists... Done\nBuilding dependency tree       \nReading state information... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.';
        return 'sudo: effective uid is not 0, is /usr/bin/sudo on a file system with the \'nosuid\' option set or an NFS file system without root privileges?';
    },
    'mkdir': (args: string) => args ? `` : 'mkdir: missing operand',
    'df': (args: string) => {
        if (args.includes('-h')) {
            return 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        30G  5.5G   24G  19% /\ntempfs          3.9G     0  3.9G   0% /dev/shm\n/dev/sdb1        64G  1.2G   62G   2% /mnt';
        }
        return 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1       30364024 5729420  24618220  19% /';
    },
    'cat': (args: string) => {
        if (args.includes('lab-instructions.txt')) return 'Welcome to the lab! Follow the steps in the portal to complete your tasks.';
        return args ? `cat: ${args}: No such file or directory` : 'cat: missing operand';
    },
    'uname': (args: string) => args.includes('-a') ? 'Linux lab-vm 5.15.0-1049-azure #56~20.04.1-Ubuntu SMP Thu Sep 26 14:12:05 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux' : 'Linux'
};

export default function SimulatedTerminal() {
    const [lines, setLines] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [bootIndex, setBootIndex] = useState(0);
    const [isBooting, setIsBooting] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Boot animation effect
    useEffect(() => {
        if (bootIndex < BOOT_SEQUENCE.length) {
            const timeout = setTimeout(() => {
                setLines(prev => [...prev, BOOT_SEQUENCE[bootIndex]]);
                setBootIndex(prev => prev + 1);
            }, 60 + Math.random() * 100); // Random typing speed
            return () => clearTimeout(timeout);
        } else {
            setIsBooting(false);
        }
    }, [bootIndex]);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    // Auto-focus input
    useEffect(() => {
        if (!isBooting) {
            inputRef.current?.focus();
        }
    }, [isBooting]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const fullCommand = inputValue.trim();
            const [cmd, ...args] = fullCommand.split(' ');
            const argString = args.join(' ');

            const newLines = [...lines, `azureuser@lab-vm:~$ ${inputValue}`];

            if (fullCommand === 'clear') {
                setLines([]);
            } else if (COMMANDS[cmd]) {
                const output = typeof COMMANDS[cmd] === 'function'
                    ? (COMMANDS[cmd] as Function)(argString)
                    : COMMANDS[cmd];

                if (output) newLines.push(output as string);
                setLines(newLines);
            } else if (fullCommand !== '') {
                newLines.push(`${cmd}: command not found`);
                setLines(newLines);
            } else {
                setLines(newLines);
            }

            setInputValue('');
        }
    };

    return (
        <div
            className="flex flex-col h-full bg-black text-green-400 font-mono text-sm p-4 overflow-hidden"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {lines.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
                ))}

                {!isBooting && (
                    <div className="flex items-center gap-2">
                        <span className="text-green-500 whitespace-nowrap">azureuser@lab-vm:~$</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none border-none text-white caret-green-500"
                            autoFocus
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
