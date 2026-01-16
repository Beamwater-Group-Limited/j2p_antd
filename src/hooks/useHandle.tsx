import {useCallback} from "react";
export function useHandle ( ) {
    const handleKeyDown = useCallback(e => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const { selectionStart, selectionEnd, value } = e.target;
            e.target.value =
                value.slice(0, selectionStart) +
                '    ' +                       // 四个空格
                value.slice(selectionEnd);
            // 将光标移到插入后
            e.target.selectionStart = e.target.selectionEnd = selectionStart + 4;
        }
    }, []);
    return {
        handleKeyDown
    }
}
