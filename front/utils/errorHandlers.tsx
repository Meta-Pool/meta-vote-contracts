import { getTxStatus } from "../lib/near";

export const ErrorHashHandler = async (router: any, toast: any) => {
    const { transactionHashes } = router.query;
    const account_id = window.account_id!;

    if (transactionHashes !== undefined) {
        const result = await getTxStatus(
            transactionHashes as string,
            account_id
        );
        if (result.found) {
            const txSuccess = result.success && (result.data !== '0' || result.data === '')
            if (txSuccess) {
                toast({
                    title: "Transaction success.",
                    status: "success",
                    duration: 9000,
                    position: "top-right",
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Transaction error.",
                    description: result?.errorMessage,
                    status: "error",
                    duration: 9000,
                    position: "top-right",
                    isClosable: true,
                });
            }
        }
    }
    setTimeout(()=>{
        removeQueryString();
    },1000) 
}

export const removeQueryString = () => {
    var uri = window.location.toString();
    if (uri.indexOf("?") > 0) {
        var clean_uri = uri.substring(0, uri.indexOf("?"));
        window.history.replaceState({}, document.title, clean_uri);
    }
};