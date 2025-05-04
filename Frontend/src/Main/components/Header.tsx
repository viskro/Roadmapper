export function Header(props:{ title: string }) {
    const { title } = props

    return (
        <header className="mb-5">
            <div className="flex items-center justify-center gap-4 w-full p-4">
                <h1 className="text-3xl font-bold">{title}</h1>
            </div>
        </header>
    )
}