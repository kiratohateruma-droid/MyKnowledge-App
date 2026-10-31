interface Tag {
    id: number;
    name: string;
}

interface SelectTagsProps {
    inputQuery: string;
    onInputQueryChange: (value: string) => void;
    tags: Tag[];
    selectedTagIds: number[];
    onSelectedTagIdsChange: (ids: number[]) => void;
}

const SelectTags = (props: SelectTagsProps) => {

    const filteredTags = props.tags.filter((tag) =>
        tag.name.toLowerCase().includes(
            props.inputQuery.trim().toLowerCase()) &&
        !props.selectedTagIds.includes(tag.id)
    );

    const handleSelectTag = (tagId: number) => {
        props.onSelectedTagIdsChange([
            ...props.selectedTagIds,
            tagId,
        ]);
    };

    const handleRemoveTag = (tagId: number) => {
        props.onSelectedTagIdsChange(
            props.selectedTagIds.filter((id) => id !== tagId)
        );
    };

    return (
        <div>
            <input
                value={props.inputQuery}
                onChange={(e) =>
                    props.onInputQueryChange(e.target.value)
                }
                className="input border-gray-300 bg-white text-gray-800 placeholder:text-gray-400"
                placeholder="タグを検索・入力"
            />
            {props.inputQuery.trim() !== "" && (
                <div className="mt-1 flex flex-wrap gap-2">
                    {props.tags.filter((tag) =>
                        props.selectedTagIds.includes(tag.id)
                    ).map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => {handleRemoveTag(tag.id)}}
                            className="btn btn-sm border-teal-700 bg-teal-100 text-gray-800">
                            {tag.name}
                        </button>
                    ))}
                    {filteredTags.map((tag) =>
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleSelectTag(tag.id)}
                            className="btn btn-sm border-gray-300 bg-white text-gray-800"
                        >{tag.name}</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectTags;