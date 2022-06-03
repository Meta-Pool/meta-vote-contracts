import { getTxStatus } from "../lib/near";

export const ErrorHashHandler = async (router: any, toast: any, wallet: any) => {
    const { transactionHashes } = router.query;
    if (transactionHashes !== undefined) {
        const result = await getTxStatus(
            transactionHashes as string,
            wallet?.getAccountId()
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
    removeQueryString();
}

export const removeQueryString = () => {
    var uri = window.location.toString();
    if (uri.indexOf("?") > 0) {
        var clean_uri = uri.substring(0, uri.indexOf("?"));
        window.history.replaceState({}, document.title, clean_uri);
    }
};