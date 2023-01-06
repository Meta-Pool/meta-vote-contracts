import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  InputGroup,
  InputLeftAddon,
  Input,
  InputRightAddon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  StackDivider,
  HStack,
  Square,
  Image,
  Flex,
  Stack,
  useToast,
  Divider,
  Spacer,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { ChangeEvent, useEffect, useState, ClipboardEvent } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Percentage, WarningAltFilled } from "@carbon/icons-react";
import { colors } from "../../../constants/colors";

type Props = {
  isOpen: boolean;
  onClose: any;
  slippage: number;
  minSlippage: number;
  setSlippage: (value: number) => void;
  onSetSlippageClick: (value: number) => void;
};

const SlippageSettingsModal = ({
  isOpen,
  onClose,
  slippage,
  minSlippage,
  setSlippage,
  onSetSlippageClick,
}: Props) => {
  const toast = useToast();
  const size = useBreakpointValue({ base: "xxs", md: "xs" });

  const initialValues: any = {
    slippage: slippage,
    min_slippage: minSlippage
  };

  const validation = Yup.object().shape({
    slippage: Yup.number().moreThan(
      Yup.ref("min_slippage"),
      "The slippage tolerance is invalid"
    ),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validation,
    validateOnMount: true,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values: any) => {
      onClose();
      setSlippage(values.slippage);
      onSetSlippageClick(values.slippage);
    },
  });

  return (
    <Stack mx={2}>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={size}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text color={"gray.800"}>Slippage tolerance</Text>
          </ModalHeader>
          <ModalBody>
            <Stack
              spacing={5}
              my={2}
              flexDirection={"column"}
              justifyContent={"center"}
              gap={2}
            >
              <Stack align={"flex-start"}>
                <InputGroup>
                  <Input
                    autoFocus={true}
                    id="slippage"
                    name="slippage"
                    type="number"
                    colorScheme={colors.primary}
                    value={formik.values.slippage}
                    onPaste={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                  />
                  <InputRightAddon>
                    <Percentage />
                  </InputRightAddon>
                </InputGroup>

                {formik.dirty && (
                  <Stack>
                    <Text
                      dangerouslySetInnerHTML={{
                        __html:
                          formik.errors && formik.errors.slippage
                            ? (formik.errors.slippage as string)
                            : "",
                      }}
                      fontSize={"xs"}
                      color={"red"}
                    ></Text>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter mt={10}>
            <Flex w={"100%"} justifyContent={"center"}>
              <Button
                borderRadius={100}
                variant="outline"
                onClick={onClose}
                w={{ base: "70px", md: "121px" }}
              >
                Cancel
              </Button>
              <Spacer />
              <Button
                borderRadius={44}
                borderWidth="1px"
                borderStyle="solid"
                colorScheme={colors.primary}
                onClick={(e: any) => formik.handleSubmit(e)}
                w={{ base: "80px", md: "138px" }}
              >
                Set
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default SlippageSettingsModal;
