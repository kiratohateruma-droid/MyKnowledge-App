interface Category {
    id: number;
    name: string;
}

interface SelectCategoryProps {
    categories: Category[];
    selectedCategoryId: number | null;
    onSelectedCategoryIdChange: (id: number | null) => void;
}

const SelectCategory = (props: SelectCategoryProps) => {
    return (
        <label className="select border-gray-300 bg-white ">
            <select
                value={props.selectedCategoryId ?? ""}
                onChange={(e) => {
                    props.onSelectedCategoryIdChange(
                        e.target.value === "" ? null : Number(e.target.value)
                    )
                }}
                className={` ${props.selectedCategoryId === null ? "text-gray-400" : "text-gray-800"}`}
            >
                <option value="" disabled hidden>
                    カテゴリを選択
                </option>

                {props.categories.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="btn border-0 bg-white text-gray-800 shadow-none"
                onClick={() => props.onSelectedCategoryIdChange(null)}
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </label>
    )
};

export default SelectCategory;