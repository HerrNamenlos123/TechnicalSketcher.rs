interface ToolbarProps {
    height: number;
}

function Toolbar(props: ToolbarProps) {
    return (
        <div
            style={{ width: "100%", height: "4rem", background: "#202020" }}
        ></div>
    );
    return (
        <nav class="bg-gray-800">
            <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div class="relative flex h-16 items-center justify-between">
                    <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div class="hidden sm:ml-6 sm:block">
                            <div class="flex space-x-2">
                                <a
                                    href="#"
                                    class="bg-gray-900 text-white rounded-md px-2 py-2 text-sm font-medium"
                                    aria-current="page"
                                >
                                    Still
                                </a>
                                <a
                                    href="#"
                                    class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-2 py-2 text-sm font-medium"
                                >
                                    to
                                </a>
                                <a
                                    href="#"
                                    class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-2 py-2 text-sm font-medium"
                                >
                                    be
                                </a>
                                <a
                                    href="#"
                                    class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-2 py-2 text-sm font-medium"
                                >
                                    implemented
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Toolbar;
